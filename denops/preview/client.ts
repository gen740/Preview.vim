import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import ky from "https://cdn.skypack.dev/ky?dts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0/helper/mod.ts";
import * as path from "https://deno.land/std@0.119.0/path/mod.ts";

export class Client {
  buf_data: string[];
  opts_buf: any[];
  is_server_ready = false;
  notify_once = false;
  port = 3000;
  ws = new WebSocket("ws://localhost:8080");
  denops: Denops;
  filetype: string = "markdown";

  constructor(denops: Denops) {
    this.denops = denops;
    this.ws = new WebSocket("ws://localhost:8080");
    this.buf_data = [];
    this.opts_buf = [];
  }

  async start_server() {
    try {
      let get_ready: any = await ky.get("http://localhost:3000/ready").json();
      this.is_server_ready = get_ready.state === "ready";
    } catch (e) { // when server is not ready
      this.is_server_ready = false;
    }
    if (!this.is_server_ready) {
      Deno.run({
        cmd: [
          "node",
          path.join(
            path.dirname(path.fromFileUrl(import.meta.url)),
            "../../previewer/dist/index.js",
          ),
        ],
      });
    }
  }

  send_data(...data: any[]) {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify({ type: this.filetype, msg: data[0] }));
    } else {
      this.connect_ws();
    }
  }

  async connect_ws() {
    this.ws = new WebSocket("ws://localhost:8080");
    this.ws.onopen = (_event) => {};
    this.ws.onmessage = (event) => {
      let data = JSON.parse(event.data);
      switch (data.type) {
        case "notification":
          this.send_data(this.buf_data);
          setTimeout(() => {
            this.send_data(this.buf_data);
          }, 200);
          break;
        default:
      }
    };
  }

  async notify(msg: string) {
    execute(
      this.denops,
      `call preview#notification("` + msg + `")`,
    );
  }
}
