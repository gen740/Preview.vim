import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0/helper/mod.ts";
import ky from "https://cdn.skypack.dev/ky?dts";

import { Client } from "./client.ts";

export async function main(denops: Denops) {
  let cl = new Client(denops);

  denops.dispatcher = {
    async set_opts(...data: any[]) {
      cl.opts_buf = data;
      if (cl.ws.readyState === cl.ws.OPEN) {
        cl.ws.send(JSON.stringify({ type: "options", msg: data[0] }));
      }
    },

    async start(...text: any[]) {
      cl.connect_ws();
      cl.buf_data = text;
      cl.start_server();
      setTimeout(async () => {
        if (cl.ws.readyState !== cl.ws.OPEN) {
          cl.connect_ws();
        }
        await ky.get(
          "http://localhost:" + cl.port + "/ready",
        );
        cl.ws.send(JSON.stringify({ type: "options", msg: cl.opts_buf[0] }));
        cl.send_data(cl.buf_data);
        await execute(
          denops,
          `call preview#auto_browser_open()`,
        );
      }, 1000); // サーバーが始まるまで待つ
      if (!cl.is_server_ready) {
        console.log("Fail to Start Server");
      }
      if (!cl.notify_once) {
        cl.notify("Plese Open http://localhost:" + cl.port + "/previewer ");
        cl.notify_once = true;
      }
    },

    async send_current_buf(...text: any[]) {
      cl.buf_data = text;
      cl.start_server();
      cl.send_data(cl.buf_data);
    },

    async send_cursor_linenum(data: any) {
      if (cl.ws.readyState === cl.ws.OPEN) {
        cl.ws.send(JSON.stringify({ type: "cur_pos", msg: data }));
      }
    },
  };

  await execute(
    denops,
    `call preview#auto_start()`,
  );
}
