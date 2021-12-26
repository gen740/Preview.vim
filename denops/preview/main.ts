import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import * as path from "https://deno.land/std@0.119.0/path/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0/helper/mod.ts";
import ky from "https://cdn.skypack.dev/ky?dts";

let is_server_ready = false;
let is_browser_opened = false;
let port = 3000;

async function start_server() {
  try {
    let get_ready: { state: string } = await ky.get(
      "http://localhost:" + port + "/ready",
    ).json();
    is_server_ready = get_ready.state === "ready";
  } catch (e) { // get リクエストに失敗するなら
    console.log("Server has not been started");
    is_server_ready = false;
  }
  if (!is_server_ready) {
    try {
      console.log("Starting Server ...");
      Deno.run({
        cmd: [
          "node",
          path.join(
            path.dirname(path.fromFileUrl(import.meta.url)),
            "../../previewer/dist/index.js",
          ),
        ],
      });
    } catch (e) {
      console.log("Server has already started");
    }
  }
}
let ws: WebSocket;

async function connect_ws() {
  try {
    ws = new WebSocket("ws://localhost:8080");
  } catch (e) {
    console.log(e);
  }
  ws.onopen = (_event) => {
    console.log("connected");
  };
  ws.onmessage = (event) => {
    let data = JSON.parse(event.data);
    switch (data.type) {
      case "notification":
        is_browser_opened = data.msg.in_browser_opend;
        console.log("Sended");
        send_data(buf_data);
        break;
      default:
    }
  };
}

let buf_data: string[];
let opts_buf: any[];

function send_data(...data: any[]) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify({ type: "markdown", msg: data[0] }));
    if (!is_browser_opened) {
      console.log("Plese Open http://localhost:" + port + "/previewer");
    }
  } else {
    console.log("Server has not been ready");
    connect_ws();
  }
}

export async function main(denops: Denops) {
  denops.dispatcher = {
    async set_opts(...data: any[]) {
      opts_buf = data;
      ws.send(JSON.stringify({ type: "options", msg: data[0] }));
    },
    async startup(...text: any[]) {
      connect_ws();
      buf_data = text;
      await start_server();
      setTimeout(async () => {
        if (ws.readyState !== 1) {
          connect_ws();
        }
        await ky.get(
          "http://localhost:" + port + "/ready",
        );
        ws.send(JSON.stringify({ type: "options", msg: opts_buf[0] }));
        send_data(buf_data);
        await execute(
          denops,
          `call preview#auto_browser_open()`,
        );
      }, 1000); // サーバーが始まるまで待つ
    },
    async send_current_buf(...text: any[]) {
      buf_data = text;
      await start_server();
      send_data(buf_data);
    },
    async send_cursor_linenum(data: number) {
      ws.send(JSON.stringify({ type: "cur_pos", msg: data }));
    },
  };
  await execute(
    denops,
    `call preview#auto_start()`,
  );
}
