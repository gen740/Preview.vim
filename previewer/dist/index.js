var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import clone from "clone";
import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import * as path from "path";
import * as url from "url";
import markdown_renderer from './markdown_render.js';
import cheerio from 'cheerio';
import * as fs from "fs";
var app = express();
var __dirname = path.dirname(url.fileURLToPath(import.meta.url));
var publicDir = path.join(__dirname, "../public");
var theme_has_changed = false;
var $ = cheerio.load(fs.readFileSync(path.join(publicDir, "index.html")));
var setting_file = path.join(__dirname, "./setting.json");
var preview_opts = {
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
function save_options(opts) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs.writeFileSync(setting_file, JSON.stringify(opts));
            return [2 /*return*/];
        });
    });
}
function apply_style($2) {
    var base_theme;
    try {
        base_theme = fs.readFileSync(path.join(publicDir, preview_opts.theme + ".css")).toString();
    }
    catch (e) {
        console.log("file has not been found");
        base_theme = '';
    }
    $2("#_base_theme").replaceWith("<style id=\"_base_theme\">" +
        base_theme +
        "</style>");
    if (preview_opts.theme === "default") {
        $2("#_highlightjs_theme").replaceWith("<link id=\"_highlightjs_theme\" rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/default.min.css\">");
    }
    else if (preview_opts.theme === "default_dark") {
        $2("#_highlightjs_theme").replaceWith("<link id=\"_highlightjs_theme\" rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/dark.min.css\" /> ");
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var wss;
        return __generator(this, function (_a) {
            wss = new WebSocketServer({ port: preview_opts.ws_port })
                .on('error', function (_err) {
                console.log("WebSocket Does not been created");
            });
            wss.on("connection", function connection(ws) {
                var _this = this;
                ws.on("message", function (data) {
                    var res = JSON.parse(data);
                    switch (res.type) {
                        case "cur_pos":
                            wss.clients.forEach(function (client) {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({ type: "cur_pos", msg: res.msg }));
                                }
                                ;
                            });
                            break;
                        case "markdown":
                            wss.clients.forEach(function (client) { return __awaiter(_this, void 0, void 0, function () {
                                var res_msg;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(client.readyState === WebSocket.OPEN)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, markdown_renderer(res.msg, preview_opts)];
                                        case 1:
                                            res_msg = _a.sent();
                                            client.send(JSON.stringify({ type: "show", msg: res_msg }));
                                            _a.label = 2;
                                        case 2:
                                            ;
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            break;
                        case "options":
                            preview_opts = clone(res.msg);
                            save_options(res.msg);
                            wss.clients.forEach(function (client) {
                                if (client.readyState === WebSocket.OPEN) {
                                    if (theme_has_changed) {
                                        client.send(JSON.stringify({ type: "theme_has_changed" }));
                                    }
                                }
                                ;
                            });
                            break;
                        case "notification":
                            if (res.msg === "browser_is_ready") {
                                wss.clients.forEach(function (client) {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify({ type: "notification", msg: "browser_is_ready" }));
                                    }
                                    ;
                                });
                            }
                            break;
                        case "reset_settings":
                            fs.unlink(setting_file, function (_err) { });
                            break;
                        default:
                    }
                });
            });
            app.use(express.static(publicDir));
            app.get("/previewer", function (_req, res) {
                apply_style($);
                res.send($.html());
                wss.clients.forEach(function (client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "notification", msg: { is_browser_opened: true } }));
                    }
                    ;
                });
            });
            app.get("/ready", function (_req, res) {
                res.send(JSON.stringify({ state: "ready" }));
            });
            app.listen(preview_opts.port).on('error', function (_err) {
                console.log("cannot create HTTP server");
            });
            console.log("server Started");
            return [2 /*return*/];
        });
    });
}
main();
//# sourceMappingURL=index.js.map