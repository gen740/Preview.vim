import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0/helper/mod.ts";

import ky from "https://cdn.skypack.dev/ky?dts";

import { Client } from "./client.ts";

export async function main(denops: Denops) {
  let cl = new Client(denops);

  denops.dispatcher = {
    async set_opts(...data: any[]) {
      cl.opts_buf = JSON.parse(JSON.stringify(data));
      if (cl.ws.readyState === cl.ws.OPEN) {
        cl.ws.send(JSON.stringify({ type: "options", msg: cl.opts_buf[0] }));
      }
    },

    async test(text: any, text2: any) {
      console.log(text);
      console.log(text2);
    },

    async start(filetype: any, ...text: any[]) {
      cl.filetype = filetype;
      cl.buf_data = text[0];
      (async () => {
        await cl.start_server();
        await cl.connect_ws();
        if (!cl.is_server_ready) {
          for (let i = 0, len = 10; i < len; i++) {
            try {
              let get_ready: any = await ky
                .get("http://localhost:3000/ready")
                .json();
              cl.is_server_ready = get_ready.state === "ready";
            } catch (e) {}
            if (cl.is_server_ready) {
              while (cl.ws.readyState !== cl.ws.OPEN) {
                cl.connect_ws();
                await (new Promise((r) => setTimeout(r, 100)));
              }
              setTimeout(() => {
                cl.send_data(cl.buf_data);
                cl.ws.send(
                  JSON.stringify({ type: "options", msg: cl.opts_buf[0] }),
                );
              }, 300);
              await execute(
                denops,
                `call preview#auto_browser_open()`,
              );
              break;
            }
            await (new Promise((r) => setTimeout(r, 100)));
          }
        } else {
          setTimeout(() => {
            cl.send_data(cl.buf_data);
            cl.ws.send(
              JSON.stringify({ type: "options", msg: cl.opts_buf[0] }),
            );
          }, 300);
        }
        if (!cl.is_server_ready) {
          console.log("Fail to Start Server");
        }
        if (!cl.notify_once) {
          cl.notify(
            "Plese Open http://localhost:" + cl.port + "/" + filetype + " ",
          );
          cl.notify_once = true;
          console.log(cl.opts_buf[0]);
        }
      })();
    },

    async send_current_buf(...text: any[]) {
      cl.buf_data = text;
      if (!cl.is_server_ready) {
        cl.start_server();
      }
      if (cl.ws.readyState === cl.ws.OPEN) {
        cl.send_data(cl.buf_data);
      }
    },

    async send_cursor_linenum(data: any) {
      if (cl.ws.readyState === cl.ws.OPEN) {
        cl.ws.send(JSON.stringify({ type: "cur_pos", msg: data }));
      }
    },
  };

  execute(
    denops,
    ` if exists ('g:preview_auto_start')
        if g:preview_auto_start == 1 && (&filetype ==# 'markdown' || &filetype ==# 'text')
          call preview#start(&ft)
        endif
      endif `,
  );
}
