import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import { ensureString } from "https://deno.land/x/unknownutil@v0.1.1/mod.ts";

export async function main(denops: Denops) {
  let ws = new WebSocket("ws://localhost:8080");
  let test = { type: "test", msg: "this is the test message" };
  ws.onopen = (event) => {
    console.log("connected");
  };
  denops.dispatcher = {
    async echo(...text: any[]) {
      console.log("Send The Markdown");
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "markdown", msg: text }));
      } else {
        console.log("Server has not been ready");
      }
    },
  };
}
