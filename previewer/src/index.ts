import { marked } from "marked";
import WebSocket, { WebSocketServer } from "ws";

import express from "express";
import * as path from "path";
import * as cheerio from "cheerio";
import * as fs from "fs";

const app = express();

let publicDir = path.join(__dirname, "public");
var $ = cheerio.load(fs.readFileSync(path.join(publicDir, "index.html")));

function apply_style($: cheerio.CheerioAPI) {
  $("style").replaceWith(
    "<style>" +
    fs.readFileSync(path.join(publicDir, "notes-dark.css")).toString() +
    "</style>",
  );
  $("style").after(
    "<style>" + fs.readFileSync(path.join(publicDir, "typora.css").toString()) +
    "</style>",
  );
}

const wss = new WebSocketServer({ port: 8080 });

function markdown_parser(data: string): string {
  return marked.parse(data);
}

wss.on("connection", function connection(ws) {
  console.log("Connected");

  console.log(wss.listenerCount("connection"));
  ws.on("message", (data: string) => {
    let res = JSON.parse(data);
    switch (res.type) {
      case "markdown":
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "show", msg: markdown_parser(res.msg.join('\n')) }));
          };
        })
        break;
      default:
    }
  });
});


app.use(express.static(publicDir));

app.get("/page", (req, res) => {
  apply_style($);
  res.send($.html());
});

app.listen(3000);
