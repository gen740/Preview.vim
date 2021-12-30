import * as path from "https://deno.land/std@0.119.0/path/mod.ts";

Deno.run({
  cmd: [
    "node",
    path.join(
      path.dirname(path.fromFileUrl(import.meta.url)),
      "../previewer/dist/index.js",
    ),
  ],
});

setTimeout(() => {}, 100000);
