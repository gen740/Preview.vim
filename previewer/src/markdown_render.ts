import { PreviewOptions } from "./utils.js"

import clone from "clone";
import { performance } from "perf_hooks";

import { unified } from 'unified'

import plantumlEncoder from "plantuml-encoder";
import rehypeDocument from 'rehype-document'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeMathjax from 'rehype-mathjax'

import { remarkExtendedTable, extendedTableHandlers } from 'remark-extended-table';
import { visit } from 'unist-util-visit'

var start: number, end: number;

export class PreviewRenderer {
  cur_pos_arr: number[];

  constructor(cur_pos_arr: number[]) {
    this.cur_pos_arr = cur_pos_arr
  }

  async markdown_render(data: string[], opts_str: string)
    : Promise<string> {
    let opts = JSON.parse(opts_str)
    if (opts.DEBUG) {
      start = performance.now();
    }

    let data_buf = clone(data);
    let concated_text: string = data_buf.join('\n');

    // concated_text = concated_text.replace(/｜/g, `<ruby>`)
    // concated_text = concated_text.replace(/《/g, `<rt>`)
    // concated_text = concated_text.replace(/》/g, `</rt></ruby>`)

    let Emoji = () => {
      if (opts.emoji) {
        return remarkGemoji;
      } else {
        return () => { };
      }
    }

    let GFM = () => {
      if (opts.GFM) {
        return remarkGfm;
      } else {
        return () => { };
      }
    }

    let Math = () => {
      if (opts.math === "none") {
        return () => { };
      } else {
        return remarkMath;
      }
    }

    let RawHTML = () => {
      if (opts.enableRawHTML) {
        return rehypeRaw;
      } else {
        return () => { };
      }
    }

    let MathCompilar = () => {
      if (opts.math === "none") {
        return () => { };
      } else if (opts.math === "Katex") {
        return rehypeKatex;
      } else if (opts.math === "MathJax") {
        return rehypeMathjax
      } else {
        console.error("[Preview.vim] Does not support " + opts.math + " as a Math Compilar")
        return () => { };
      }
    }

    let PlantUML = () => {
      if (opts.plantuml) {
        return this.remarkPlantUML;
      } else {
        return () => { };
      }
    }

    const result_data = await unified()
      .use(remarkParse)
      .use(Emoji())
      .use(remarkExtendedTable)
      .use(GFM())
      .use(Math())
      .use(remarkRehype, null, { allowDangerousHtml: true, handlers: Object.assign({}, extendedTableHandlers) })
      .use(RawHTML())
      .use(() => (tree: import('hast').Root) => {
        this.cur_pos_arr = []
        visit(tree, (node: any) => {
          if (node.properties !== undefined && node.position !== undefined) {
            (node.properties as any).id = "line_num_" + JSON.stringify(
              node.position.start.line
            );
            this.cur_pos_arr.push(node.position.start.line)
          };
        });
        this.cur_pos_arr = Array.from(new Set(this.cur_pos_arr))
      })
      .use(MathCompilar())
      .use(rehypeDocument, {
        css: 'https://cdn.jsdelivr.net/npm/katex@0.15.0/dist/katex.min.css'
      })
      .use(PlantUML())
      .use(this.remarkMermaid)
      .use(rehypeStringify)
      .process(concated_text)

    let final_data = String(result_data)


    if (opts.DEBUG) {
      end = performance.now();
      console.log((end - start) + "time");
    }

    return String(final_data);

  }

  remarkPlantUML() {
    const options = { baseUrl: "https://www.plantuml.com/plantuml/png" };
    return (tree: import('hast').Root) => {
      visit(tree, (node: any) => {
        if (node.tagName === "code"
          && JSON.stringify(node.properties.className) === JSON.stringify(['language-plantuml'])) {
          node.type = "element";
          node.tagName = "image";
          node.properties.src = `${options.baseUrl.replace(/\/$/, "")}/${plantumlEncoder.encode(node.children[0].value)}`
          node.children[0].value = '';
        }
      });
    };
  }

  remarkMermaid() {
    return (tree: import('hast').Root) => {
      visit(tree, (node: any) => {
        if (node.tagName === "code"
          && JSON.stringify(node.properties.className) === JSON.stringify(['language-mermaid'])) {
          node.type = "element";
          node.tagName = "div";
          node.properties.className = ['mermaid']
        }
      });
    };
  }
}
