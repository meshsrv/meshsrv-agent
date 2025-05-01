const worker = self as unknown as Worker;
let manifest: PluginManifest;
worker.onmessage = (e) => {
  const v = e.data;
  manifest = v.manifest;
  main(v.entrypoint, v.manifest);
};

function main(entrypoint: string, manifest: PluginManifest) {
  worker.onmessage = () => {
    console.warn(`${manifest.name}@${manifest.version} is still in loading...`);
  };

  import(entrypoint).then((module) => {
    const plugin = module.default as Plugin;
    plugin.onLoad?.(onLoadSDK);
    worker.postMessage({
      type: "loaded",
      payload: {
        capability,
      },
    });
    plugin.onLoaded?.(loadedSDK);
  });
}

const capability = {
  dataSource: new Map<string, DataSourceCapability>(),
  event: new Map<string, EventCapability>(),
  action: new Map<string, ActionCapability>(),
};

const onLoadSDK: OnLoadSDK = {
  addDataSource(dataSource) {
    capability.dataSource.set(dataSource.name, dataSource);
  },
  addEvent(event) {
    capability.event.set(event.name, event);
  },
  addAction(action) {
    capability.action.set(action.name, action);
  },
};

const loadedSDK: LoadedSDK = {
  push(name, data) {
    worker.postMessage({
      type: "dataSource",
      payload: {
        name: `${manifest.name}.${name}`,
        time: Date.now(),
        data,
      },
    });
  },
  emit(name, payload) {
    console.log(name, payload);
  },
};
