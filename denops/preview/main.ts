import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import * as path from "https://deno.land/std@0.119.0/path/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0/helper/mod.ts";
import ky from "https://cdn.skypack.dev/ky?dts";

let is_server_ready = false;
let is_browser_opened = false;
let notify_once = false;
let port = 3000;
let ws: WebSocket; // ws://localhost:8080

export async function main(denops: Denops) {
  async function start_server() {
    try {
      let get_ready: any = await ky.get("http://localhost:3000/ready").json();
      // will return { state: "ready" } when server is open
      is_server_ready = get_ready.state === "ready";
    } catch (e) { // when server is not ready
      is_server_ready = false;
    }
    if (!is_server_ready) {
      Deno.run({
        cmd: [
          "node",
          path.join(
            path.dirname(path.fromFileUrl(import.meta.url)),
            "../../previewer/dist/index.js",
          ),
        ],
      });
      notify("Starting Server ...");
    }
  }

  async function connect_ws() {
    ws = new WebSocket("ws://localhost:8080");
    ws.onopen = (_event) => {
    };
    ws.onmessage = (event) => {
      let data = JSON.parse(event.data);
      switch (data.type) {
        case "notification":
          is_browser_opened = data.msg.in_browser_opend;
          send_data(buf_data);
          break;
        default:
      }
    };
  }

  let buf_data: string[];
  let opts_buf: any[];

  function send_data(...data: any[]) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "markdown", msg: data[0] }));
      if (!notify_once) {
        notify("Plese Open http://localhost:" + port + "/previewer ");
        notify_once = true;
      }
    } else {
      connect_ws();
    }
  }
  async function notify(msg: string) {
    execute(
      denops,
      `call preview#notification("` + msg + `")`,
    );
  }

  denops.dispatcher = {
    async set_opts(...data: any[]) {
      opts_buf = data;
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "options", msg: data[0] }));
      }
    },
    async startup(...text: any[]) {
      connect_ws();
      buf_data = text;
      start_server();
      setTimeout(async () => {
        if (ws.readyState !== ws.OPEN) {
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
      start_server();
      send_data(buf_data);
    },
    async send_cursor_linenum(data: number) {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "cur_pos", msg: data }));
      }
    },
  };
  await execute(
    denops,
    `call preview#auto_start()`,
  );
}
