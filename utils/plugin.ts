import { send } from "./ws.ts";

const plugins: Record<string, Worker> = {};

export function loadPlugin(entrypoint: string, manifest: PluginManifest) {
  if (plugins[manifest.name] !== undefined)
    throw new Error(`Plugin ${manifest.name} already loaded.`);
  if (entrypoint.match(/^file:\/\/.*?\.ts$/) === null)
    throw new Error(`Invalid entrypoint: ${entrypoint}`);
  const entrypointPath = entrypoint.replace(/^file:\/\//, "");

  const permissions = {
    read: false,
    write: false,
    import: false,
    net: false,
    run: false,
    env: false,
    sys: false,
    ffi: false,
    ...manifest.permissions,
  } satisfies Required<Deno.PermissionOptionsObject>;
  if (permissions.read !== true) {
    permissions.read = Array.isArray(permissions.read)
      ? [...permissions.read, entrypointPath]
      : [entrypointPath];
  }

  const worker = new Worker(import.meta.resolve("../runner/index.ts"), {
    type: "module",
    name: `${manifest.name}@${manifest.version}`,
    deno: { permissions },
  });

  worker.onerror = (e) => {
    console.error(
      "[Plugin Error]",
      `(${manifest.name}@${manifest.version})`,
      e.message
    );
  };
  worker.onmessage = function (e) {
    onPluginMsg(manifest.name, this, e);
  };

  worker.postMessage({ entrypoint, manifest });
  plugins[manifest.name] = worker;
}

function onPluginMsg(name: string, worker: Worker, e: MessageEvent) {
  if (e.data.type === "loaded") {
    console.log(`[Plugin Loaded] ${name}`);
    return;
  }
  // console.log(`[Received Plugin Msg] (${name})`, e.data);
  if (e.data.type === "dataSource") {
    send("dataSource", e.data.payload);
  }
}
