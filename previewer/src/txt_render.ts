import clone from "clone";
import { performance } from "perf_hooks";

var start: number, end: number;

export class Txt_Renderer {
  cur_pos_arr: number[];

  constructor(cur_pos_arr: number[]) {
    this.cur_pos_arr = cur_pos_arr
  }

  async render(data: string[], opts_str: string)
    : Promise<string> {
    let opts = JSON.parse(opts_str)
    if (opts.DEBUG) {
      start = performance.now();
    }

    let data_buf = clone(data);
    let data_mid: string[] = [];

    for (let i = 0, len = data_buf.length; i < len; i++) {
      console.log(data_buf[i]);
      if (data_buf[i][data_buf[i].length - 1] !== "\t") {
        data_mid.push(data_buf[i] + '<br>')
        // data_mid.push(data_buf[i] + '<span id="line_num_' + i + '"></span><br>')
      } else {
        data_mid.push(data_buf[i].replace(/\t/, ''))
      }
    }

    let concated_text: string = data_mid.join('\n');

    concated_text = concated_text.replace(/｜/g, `<ruby>`)
    concated_text = concated_text.replace(/《/g, `<rt>`)
    concated_text = concated_text.replace(/》/g, `</rt></ruby>`)

    if (opts.DEBUG) {
      end = performance.now();
      console.log((end - start) + "time");
    }

    return String(concated_text);

  }
}
