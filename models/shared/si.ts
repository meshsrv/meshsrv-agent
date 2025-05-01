import { Systeminformation } from "systeminformation";

export interface BasicData {
  uuid: string;
  osInfo: Systeminformation.OsData;
  system: Systeminformation.SystemData;
  bios: Systeminformation.BiosData;
  baseboard: Systeminformation.BaseboardData;
  chassis: Systeminformation.ChassisData;
  cpu: Systeminformation.CpuData;
  mem: Pick<Systeminformation.MemData, "total">;
  memLayout: Systeminformation.MemLayoutData[];
  graphics: Systeminformation.GraphicsData;
  diskLayout: Systeminformation.DiskLayoutData[];
  networkInterfaces: Systeminformation.NetworkInterfacesData[];
}
