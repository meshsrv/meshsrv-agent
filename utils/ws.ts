import { getBasicData, getUUID } from "./si.ts";

let socket: WebSocket;
let queue: object[] = [];
let intervalNum: number;
let closing = false;

export function initConnection() {
  (function connect() {
    socket = new WebSocket(
      `https://${Deno.env.get("CORE_HOST")}/ws/agent`,
      Deno.env.get("AGENT_SECRET") // smuggle token inside Sec-WebSocket-Protocol
    );
    socket.addEventListener("open", async () => {
      console.log("Connected to Core.");
      socket.send(
        JSON.stringify({
          uuid: await getUUID(),
          msgs: [{ type: "online", payload: await getBasicData() }],
        })
      );
      intervalNum = setInterval(async () => {
        if (queue.length > 0 && socket.readyState === 1) {
          const v = {
            uuid: await getUUID(),
            msgs: queue,
          };
          queue = [];
          socket.send(JSON.stringify(v));
        } else {
          socket.send(
            JSON.stringify({
              uuid: await getUUID(),
              msgs: [],
            })
          );
        }
      }, 1000);
    });
    socket.addEventListener("error", (e) => {
      if (e instanceof ErrorEvent)
        console.error("[WebSocket Error]", e.message);
      else console.error("[WebSocket Error]", "An unknown error occurred");
      socket.close();
    });
    socket.addEventListener("close", () => {
      clearInterval(intervalNum);
      setTimeout(connect, Math.floor(Math.random() * 4000 + 1000));
    });
    socket.addEventListener("message", (e) => {
      console.log(e.data);
    });
  })();

  const closeFn = async () => {
    if (closing) return;
    closing = true;
    console.log("\nClosing...");
    socket.send(
      JSON.stringify({
        uuid: await getUUID(),
        msgs: [{ type: "offline", payload: { uuid: await getUUID() } }],
      })
    );
    // TODO: need an ack mechanism
    setTimeout(Deno.exit, 1000);
  };
  Deno.addSignalListener("SIGINT", closeFn);
  addEventListener("unload", closeFn);
}

// deno-lint-ignore no-explicit-any
export function send(type: string, payload: any) {
  queue.push({ type, payload });
}
