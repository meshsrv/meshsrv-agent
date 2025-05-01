import si from "systeminformation";
import { BasicData } from "../models/shared/si.ts";

let uuid: string;

export async function getUUID(): Promise<string> {
  if (!uuid) uuid = (await si.uuid()).os;
  return uuid;
}

export async function getBasicData(): Promise<BasicData> {
  const valuesObject: Record<keyof Omit<BasicData, "uuid">, string> = {
    osInfo: "*",
    system: "*",
    bios: "*",
    baseboard: "*",
    chassis: "*",
    cpu: "*",
    mem: "total",
    memLayout: "*",
    graphics: "*",
    diskLayout: "*",
    networkInterfaces: "*",
  };
  const info: BasicData = await si.get(valuesObject);
  info.uuid = await getUUID();
  return info;
}
