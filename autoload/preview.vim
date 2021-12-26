function preview#send_cur_buf() abort
  let curbufnr = getbufinfo()[bufname()]['bufnr']
  let cur_buf_content =  getbufline(curbufnr, 1, '$')
  call denops#request('preview', 'send_current_buf', cur_buf_content)
endfunction

function preview#startup() abort
  let curbufnr = getbufinfo()[bufname()]['bufnr']
  let cur_buf_content =  getbufline(curbufnr, 1, '$')
  call denops#request('preview', 'startup', cur_buf_content)
endfunction

function preview#start() abort
  call preview#startup()
  call preview#set_opts()
  let g:preview_server_started = v:true
  augroup PreviewNvim
    autocmd TextChangedI,TextChangedP,TextChanged <buffer> call preview#send_cur_buf()
  augroup END
endfunction

function preview#set_opts() abort
  call denops#request('preview', 'set_opts', [g:preview_options])
endfunction

function preview#theme(theme_name)
  if a:theme_name ==# 'default' || a:theme_name ==# 'default_dark'
    let g:preview_options['theme'] = a:theme_name
    call preview#set_opts()
  else
    echo 'Preview vim theme supported "default" or "default_dark" option'
  endif
endfunction

function preview#auto_start() abort
  if g:preview_auto_start == 1 && &filetype ==# 'markdown'
    call preview#start()
  endif
endfunction

function preview#auto_browser_open() abort
  if exists('g:preview_open_cmd')
    call system(g:preview_open_cmd . ' http://localhost:3000/previewer')
  endif
  if has('nvim')
    if exists('g:preview_enable_notify')
      if g:preview_enable_notify
        lua require("notify")(" Server has deployed on http://localhost:3000/previewer")
      endif
    endif
  endif
endfunction

function preview#send_cursor_linenum() abort
  if g:preview_server_started
    let cursor_linenum = getcurpos()[1]
    call denops#request('preview', 'send_cursor_linenum', [cursor_linenum])
  endif
endfunction
