// minimal client This will be inplemented by denops
import { io } from "socket.io-client";

import * as fs from "fs";
import * as path from 'path';

const socket = io("http://localhost:3000");

let publicDir = path.join(__dirname, 'markdown')


socket.on("connect", () => {
  console.log("Connected");
});


try {
  var markdown = fs.readFileSync(path.join(publicDir, 'test.md'), 'utf8');
} catch (err) {
  console.log(err);
  console.log("Cannot read file");
}

socket.emit("markdown", markdown)
