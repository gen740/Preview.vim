import clone from "clone";
import WebSocket, { WebSocketServer } from "ws";

import { PreviewOptions } from "./utils.js"

import express from "express";
import * as path from "path";
import * as url from "url";
import { Md_Renderer } from './markdown_render.js'
import { Txt_Renderer } from './txt_render.js'

import cheerio from 'cheerio';
import * as fs from "fs";

const app = express();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
let publicDir = path.join(__dirname, "../public");
var $ = cheerio.load(fs.readFileSync(path.join(publicDir, "index.html")));

let Custom_pub = path.join(String(process.env.HOME), "/.config/nvim/Preview_theme");

const setting_file = path.join(__dirname, "./setting.json");

let preview_opts: PreviewOptions = {
    DEBUG: false,
    cursor_sync_enable: "auto",
    theme: "default",
    useTyporaTheme: "none",
    custom_css_ft_list: [],
    custom_css_dict: {},
    math: 'Katex',
    GFM: true,
    plantuml: true,
    mermaid: true,
    chartjs: true,
    emoji: true,
    enableRawHTML: true,
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

function apply_style($2: any, type: string) {
    console.log(preview_opts);
    if (preview_opts.custom_css_ft_list.includes(type)) {
        if (fs.existsSync(path.join(Custom_pub, `/${type}/`
            + preview_opts.custom_css_dict[type]))) {
            console.log(`/${type}/` + preview_opts.custom_css_dict[type]);
            $2("#_base_theme").replaceWith(`<link href="preview_vim_base.css" rel="stylesheet" />`);
            $2("#_preview_theme").replaceWith(`<link href="` + `/${type}/`
                + preview_opts.custom_css_dict[type]
                + `" rel="stylesheet" />`);
        }
    }

    if (preview_opts.theme !== "disable") {
        if (!fs.existsSync(path.join(publicDir, preview_opts.theme + ".css"))) {
            console.log("file has not been found: Use default.css");
            preview_opts.theme = "default";
        }
        $2("#_base_theme").replaceWith(`<link href="preview_vim_base.css" rel="stylesheet" />`);
        $2("#_preview_theme").replaceWith(`<link href="`
            + preview_opts.theme + `.css" rel="stylesheet" />`);
    }

    if (preview_opts.theme === "default") {
        $2("#_highlightjs_theme").replaceWith(
            `<link id="_highlightjs_theme" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/default.min.css">`
        );
    } else if (preview_opts.theme === "default_dark") {
        $2("#_highlightjs_theme").replaceWith(
            `<link id="_highlightjs_theme" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/dark.min.css" /> `
        );
    }

    if (preview_opts.mermaid) {
        $2("#_mermaid_script").replaceWith(
            `<script id="_mermaid_script" src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>`
        );
    }
}

async function main() {
    let cur_position_arr: number[] = []
    let md_renderer = new Md_Renderer(cur_position_arr)
    let txt_renderer = new Txt_Renderer(cur_position_arr)
    let wss = new WebSocketServer({ port: preview_opts.ws_port })
        .on('error', (_err) => {
            console.log("WebSocket Does not been created");
        });

    wss.on("connection", function connection(ws) {
        ws.on("message", (data: string) => {
            let res = JSON.parse(data);
            if (preview_opts.DEBUG) {
                // console.log(res);
            }
            switch (res.type) {
                case "cur_pos":
                    let cursor_position_now = 0
                    let offset = 0
                    for (const i of md_renderer.cur_pos_arr) {
                        if (i === res.msg) {
                            cursor_position_now = res.msg;
                            offset = 0;
                            break;
                        }
                        if (i > res.msg) {
                            offset = offset / (i - cursor_position_now + 1);
                            console.log(offset);
                            console.log(res.msg - cursor_position_now);
                            break;
                        }
                        if (i < res.msg) {
                            cursor_position_now = i
                            offset = res.msg - i
                        }
                    }
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: "cur_pos", msg: cursor_position_now, offset: offset
                            }));
                        };
                    })
                    break;
                case "markdown":
                    wss.clients.forEach(async (client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            let res_msg = await md_renderer.render(res.msg, JSON.stringify(preview_opts));
                            client.send(JSON.stringify({
                                type: "show", mermaid: preview_opts.mermaid, msg: res_msg
                            }));
                        };
                    })
                    break;
                case "text":
                    wss.clients.forEach(async (client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            let res_msg = await txt_renderer.render(res.msg, JSON.stringify(preview_opts));
                            client.send(JSON.stringify({
                                type: "show", mermaid: preview_opts.mermaid, msg: res_msg
                            }));
                        };
                    })
                    break;
                case "options":
                    let prev_previw_opts = clone(preview_opts);
                    preview_opts = clone(res.msg);
                    if (JSON.stringify(preview_opts) !== JSON.stringify(prev_previw_opts)) {
                        save_options(res.msg);
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: "reload" }));
                            };
                        })
                    }
                    console.log("Change Options");
                    if (preview_opts.DEBUG) {
                        // console.log(preview_opts);
                    }
                    break;
                case "reset_settings":
                    fs.unlinkSync(setting_file);
                    break;
                default:
            }
        });
    });

    app.use(express.static(publicDir));
    app.use(express.static(Custom_pub));

    app.get("/markdown", (_req, res) => {
        apply_style($, 'md');
        res.send($.html());
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "notification", msg: { is_browser_opened: true } }));
            };
        })
    });

    app.get("/text", (_req, res) => {
        apply_style($, 'txt');
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
    if (preview_opts.DEBUG) {
        // console.log(preview_opts);
    }
}

main();
