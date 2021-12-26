"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const marked_1 = require("marked");
const clone_1 = __importDefault(require("clone"));
const ws_1 = __importStar(require("ws"));
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const cheerio = __importStar(require("cheerio"));
const fs = __importStar(require("fs"));
const app = (0, express_1.default)();
let publicDir = path.join(__dirname, "../public");
let theme_has_changed = false;
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
};
// Load Setting file
if (fs.existsSync(setting_file)) {
    preview_opts = JSON.parse(fs.readFileSync(setting_file).toString());
}
else {
    fs.writeFileSync(setting_file, JSON.stringify(preview_opts));
}
async function save_options(opts) {
    fs.writeFileSync(setting_file, JSON.stringify(opts));
}
function apply_style($2) {
    if (preview_opts.math === 'katex') {
        $2("#_katex_style").replaceWith(`
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.min.css"
      integrity="sha384-R4558gYOUz8mP9YWpZJjofhk+zx0AS11p36HnD2ZKj/6JR5z27gSSULCNHIRReVs"
      crossorigin="anonymous"
    />
    <script
      defer
      src="https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.min.js"
      integrity="sha384-z1fJDqw8ZApjGO3/unPWUPsIymfsJmyrDVWC8Tv/a1HeOtGmkwNd/7xUS0Xcnvsx"
      crossorigin="anonymous"
    ></script>
    <script
      defer
      src="https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/contrib/auto-render.min.js"
      integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR"
      crossorigin="anonymous"
      onload="renderMathInElement(document.body);"
    ></script>`);
    }
    let base_theme;
    try {
        base_theme = fs.readFileSync(path.join(publicDir, preview_opts.theme + ".css")).toString();
    }
    catch (e) {
        console.log("file has not been found");
        base_theme = '';
    }
    $2("#_base_theme").replaceWith(`<style id="_base_theme">` +
        base_theme +
        "</style>");
    if (preview_opts.theme === "default") {
        $2("#_highlightjs_theme").replaceWith(`<link id="_highlightjs_theme" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/default.min.css">`);
    }
    else if (preview_opts.theme === "default_dark") {
        $2("#_highlightjs_theme").replaceWith(`<link id="_highlightjs_theme" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/dark.min.css" /> `);
    }
}
function markdown_parser(data) {
    let data_buf = (0, clone_1.default)(data);
    for (let i in data) {
        if (data_buf[i].match(/```/)) {
            continue;
        }
        if (data_buf[i] === ``) {
            continue;
        }
        if (data_buf[i].match(/\s+$/g)) {
            continue;
        }
        if (data_buf[i].match(/\t+$/g)) {
            continue;
        }
        if (data_buf[i][data_buf[i].length - 1] === '|') {
            continue;
        }
        data_buf[i] = data[i] + `\u{0FE0}` + i.toString() + `\u{0FE1}`;
    }
    let result_data = data_buf.join('\n');
    // support for katex
    result_data = result_data.replace(/\\\(/g, `\\\\(`);
    result_data = result_data.replace(/\\\)/g, `\\\\)`);
    result_data = result_data.replace(/\\\}/g, `\\\\}`);
    result_data = result_data.replace(/\\\{/g, `\\\\{`);
    result_data = result_data.replace(/\\\]/g, `\\\\]`);
    result_data = result_data.replace(/\\\[/g, `\\\\[`);
    result_data = marked_1.marked.parse(result_data);
    result_data = result_data.replace(/\u0fe0/g, `<span id='cursor_pos_`);
    result_data = result_data.replace(/\u0fe1/g, `'></span>`);
    return result_data;
}
async function main() {
    let wss = new ws_1.WebSocketServer({ port: preview_opts.ws_port })
        .on('error', (err) => {
        console.log("WebSocket Does not been created");
    });
    wss.on("connection", function connection(ws) {
        ws.on("message", (data) => {
            let res = JSON.parse(data);
            switch (res.type) {
                case "cur_pos":
                    wss.clients.forEach((client) => {
                        if (client.readyState === ws_1.default.OPEN) {
                            client.send(JSON.stringify({ type: "cur_pos", msg: res.msg }));
                        }
                        ;
                    });
                    break;
                case "markdown":
                    wss.clients.forEach((client) => {
                        if (client.readyState === ws_1.default.OPEN) {
                            let res_msg = markdown_parser(res.msg);
                            client.send(JSON.stringify({ type: "show", msg: res_msg }));
                        }
                        ;
                    });
                    break;
                case "options":
                    preview_opts = (0, clone_1.default)(res.msg);
                    save_options(res.msg);
                    wss.clients.forEach((client) => {
                        if (client.readyState === ws_1.default.OPEN) {
                            if (theme_has_changed) {
                                client.send(JSON.stringify({ type: "theme_has_changed" }));
                            }
                        }
                        ;
                    });
                    break;
                case "notification":
                    if (res.msg === "browser_is_ready") {
                        wss.clients.forEach((client) => {
                            if (client.readyState === ws_1.default.OPEN) {
                                client.send(JSON.stringify({ type: "notification", msg: "browser_is_ready" }));
                            }
                            ;
                        });
                    }
                    break;
                case "reset_settings":
                    fs.unlink(setting_file, (_err) => { });
                    break;
                default:
            }
        });
    });
    app.use(express_1.default.static(publicDir));
    app.get("/previewer", (_req, res) => {
        apply_style($);
        res.send($.html());
        wss.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(JSON.stringify({ type: "notification", msg: { is_browser_opened: true } }));
            }
            ;
        });
    });
    app.get("/ready", (_req, res) => {
        res.send(JSON.stringify({ state: "ready" }));
    });
    app.listen(preview_opts.port).on('error', (err) => {
        console.log("cannot create HTTP server");
    });
}
main();
//# sourceMappingURL=index.js.map