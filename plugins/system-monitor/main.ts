import si from "systeminformation";

export default {
  onLoad(sdk) {
    sdk.addDataSource({
      name: "cpuLoad",
      type: "push",
    });

    sdk.addDataSource({
      name: "memUsed",
      type: "push",
    });
  },

  onLoaded(sdk) {
    setInterval(async () => {
      const v = await si.currentLoad();
      sdk.push("cpuLoad", v.currentLoad.toString());
    }, 2000);

    setInterval(async () => {
      const v = await si.mem();
      sdk.push("memUsed", ((v.active / v.total) * 100).toString());
    }, 2000);
  },
} satisfies Plugin;
