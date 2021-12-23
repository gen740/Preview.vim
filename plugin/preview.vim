" let getbufline()
"
" echo getbufinfo()[0]['bufnr']

function Send_cur_buf() abort
  let curbufnr = getbufinfo()[bufname()]['bufnr']
  let cur_buf_content =  getbufline(curbufnr, 1, '$')
  call denops#request('preview', 'echo', cur_buf_content)
endfunction

function PreviewStart() abort
  augroup PreviewNvim
    autocmd TextChangedI,TextChangedP,TextChanged *.md call Send_cur_buf()
  augroup END
endfunction

command PreviewStart call PreviewStart()
