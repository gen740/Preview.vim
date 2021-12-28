import clone from "clone";
import WebSocket, { WebSocketServer } from "ws";

import express from "express";
import * as path from "path";
import * as url from "url";
import markdown_renderer from './markdown_render.js'


import cheerio from 'cheerio';
import * as fs from "fs";

const app = express();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
let publicDir = path.join(__dirname, "../public");
let theme_has_changed = false
var $ = cheerio.load(fs.readFileSync(path.join(publicDir, "index.html")));

const setting_file = path.join(__dirname, "./setting.json");

let preview_opts = {
  cursor_sync_enable: true,
  filetype: "markdown",
  theme: "default",
  custom_css_dir: false,
  math: 'katex',
  port: 3000,
  ws_port: 8080,
}

// Load Setting file
if (fs.existsSync(setting_file)) {
  preview_opts = JSON.parse(fs.readFileSync(setting_file).toString())
} else {
  fs.writeFileSync(setting_file, JSON.stringify(preview_opts))
}

async function save_options(opts: any) {
  fs.writeFileSync(setting_file, JSON.stringify(opts))
}

function apply_style($2: cheerio.CheerioAPI) {
  let base_theme: string;
  try {
    base_theme = fs.readFileSync(path.join(publicDir, preview_opts.theme + ".css")).toString();
  } catch (e) {
    console.log("file has not been found");
    base_theme = '';
  }
  $2("#_base_theme").replaceWith(
    `<style id="_base_theme">` +
    base_theme +
    "</style>",
  );
  if (preview_opts.theme === "default") {
    $2("#_highlightjs_theme").replaceWith(
      `<link id="_highlightjs_theme" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/default.min.css">`
    );
  } else if (preview_opts.theme === "default_dark") {
    $2("#_highlightjs_theme").replaceWith(
      `<link id="_highlightjs_theme" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/dark.min.css" /> `
    );
  }
}

async function main() {
  let wss = new WebSocketServer({ port: preview_opts.ws_port })
    .on('error', (_err) => {
      console.log("WebSocket Does not been created");
    });

  wss.on("connection", function connection(ws) {
    ws.on("message", (data: string) => {
      let res = JSON.parse(data);
      switch (res.type) {
        case "cur_pos":
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "cur_pos", msg: res.msg }));
            };
          })
          break;
        case "markdown":
          wss.clients.forEach(async (client) => {
            if (client.readyState === WebSocket.OPEN) {
              let res_msg = await markdown_renderer(res.msg, preview_opts);
              client.send(JSON.stringify({ type: "show", msg: res_msg }));
            };
          })
          break;
        case "options":
          preview_opts = clone(res.msg);
          save_options(res.msg);
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              if (theme_has_changed) {
                client.send(JSON.stringify({ type: "theme_has_changed" }));
              }
            };
          })
          break;
        case "notification":
          if (res.msg === "browser_is_ready") {
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "notification", msg: "browser_is_ready" }));
              };
            })
          }
          break;
        case "reset_settings":
          fs.unlink(setting_file, (_err) => { });
          break;
        default:
      }
    });
  });

  app.use(express.static(publicDir));

  app.get("/previewer", (_req, res) => {
    apply_style($);
    res.send($.html());
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "notification", msg: { is_browser_opened: true } }));
      };
    })
  });

  app.get("/ready", (_req, res) => {
    res.send(JSON.stringify({ state: "ready" }));
  })

  app.listen(preview_opts.port).on('error', (_err) => {
    console.log("cannot create HTTP server");
  });
  console.log("server Started");
}

main();
