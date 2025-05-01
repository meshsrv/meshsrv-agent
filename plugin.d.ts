interface PluginManifest {
  name: string;
  version: string;
  permissions: Deno.PermissionOptionsObject;
}

interface OnLoadSDK {
  addDataSource(dataSource: DataSourceCapability): void;
  addEvent(event: EventCapability): void;
  addAction(action: ActionCapability): void;
}

interface LoadedSDK {
  push(name: string, data: string): void;
  emit(name: string, payload: string): void;
}

interface Plugin {
  onLoad?: (sdk: OnLoadSDK) => void;
  onLoaded?: (sdk: LoadedSDK) => void;
}

type DataSourceCapability =
  | {
      name: string;
      description?: string;
      type: "push";
    }
  | {
      name: string;
      description?: string;
      type: "pull";
      suggestedIntervalMillis?: number;
      requiredArg?: boolean;
      fn?: (args?: string) => Promise<string>;
    };

interface EventCapability {
  name: string;
  description?: string;
}

interface ActionCapability {
  name: string;
  description?: string;
  fn: (args?: string) => Promise<boolean>;
}
