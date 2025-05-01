import { loadPlugin } from "./utils/plugin.ts";
import { initConnection } from "./utils/ws.ts";
import { join, dirname } from "@std/path";

// Deno.env.set("DENO_TLS_CA_STORE", "");
Deno.env.set("DENO_CERT", "ca.cert.pem");
Deno.env.set("CORE_HOST", "192.168.122.1:3090");
Deno.env.set("AGENT_SECRET", "4ded469e-c4e4-45e3-b104-481e20e5999f");

initConnection();

for await (const dir of Deno.readDir("plugins")) {
  if (!dir.isDirectory) continue;
  try {
    await Deno.lstat(`./plugins/${dir.name}/manifest.json`);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
    continue;
  }

  const manifest = (
    await import(`./plugins/${dir.name}/manifest.json`, {
      with: { type: "json" },
    })
  ).default as PluginManifest;

  if (manifest.name.includes(".")) {
    throw new Error(`Plugin name cannot contain "." [${dir.name}]`);
  }
  console.log(`Loading plugin ${manifest.name}@${manifest.version} ...`);

  (await tryLoadPlugin(
    "file://" + join(import.meta.dirname!, `./plugins/${dir.name}/main.ts`),
    manifest
  )) ||
    (await tryLoadPlugin(
      "file://" +
        join(dirname(Deno.execPath()), `./plugins/${dir.name}/main.ts`),
      manifest
    ));
}

async function tryLoadPlugin(
  path: string,
  manifest: PluginManifest
): Promise<boolean> {
  console.log(`Trying to load plugin from ${path} ...`);
  try {
    await Deno.lstat(path.replace(/^file:\/\//, ""));
    loadPlugin(path, manifest);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
    return false;
  }
  return true;
}
