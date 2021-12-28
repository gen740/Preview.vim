import clone from "clone";

import { unified } from 'unified'

import rehypeDocument from 'rehype-document'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

import { remarkExtendedTable, extendedTableHandlers } from 'remark-extended-table';
import { visit } from 'unist-util-visit'

export default async function markdown_rederer(data: string[], opts: any) {
  let data_buf = clone(data);
  let concated_text: string = data_buf.join('\n');
  concated_text = concated_text.replace(/test/g, `ruby`)
  concated_text = concated_text.replace(/｜/g, `<ruby>`)
  concated_text = concated_text.replace(/《/g, `<rt>`)
  concated_text = concated_text.replace(/》/g, `</rt></ruby>`)
  let emoji_enable = false;
  let process2 = () => {
    if (emoji_enable) {
      return remarkGemoji;
    } else {
      return nothing;
    }
  }
  const result_data = await unified()
    .use(remarkParse)
    .use(process2())
    .use(remarkExtendedTable)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, null, { allowDangerousHtml: true, handlers: Object.assign({}, extendedTableHandlers) })
    .use(() => (tree) => {
      visit(tree, (node: any) => {
        if (node.properties !== undefined && node.position !== undefined)
          (node.properties as any).id = "line_num_" + JSON.stringify(
            node.position.start.line
          );
      });
    })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeDocument, {
      css: 'https://cdn.jsdelivr.net/npm/katex@0.15.0/dist/katex.min.css'
    })
    .use(rehypeStringify)
    .process(concated_text)
  let final_data = String(result_data)
  return String(final_data);

  function nothing(options = {}): any {
    return (tree: any) => {
    }
  }

}
