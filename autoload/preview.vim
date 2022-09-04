function preview#send_current_buf() abort
  let curbufnr = bufnr(bufname())
  let cur_buf_content =  getbufline(curbufnr, 1, '$')
  if g:preview_server_started
    call denops#request('preview', 'send_current_buf', cur_buf_content)
  endif
endfunction

function preview#start(filetype) abort
  " let curbufnr = getbufinfo()[bufname()]['bufnr']
  let curbufnr =  bufnr()
  let cur_buf_content =  getbufline(curbufnr, 1, '$')
  call preview#set_opts()
  call denops#request('preview', 'start', [a:filetype, cur_buf_content])
  let g:preview_server_started = v:true
  if g:preview_enable_bufSync
    if g:preview_fast_bufSync
      augroup PreviewNvim
        au!
        autocmd TextChangedI,TextChangedP,TextChanged <buffer> call preview#send_current_buf()
      augroup END
    else
      augroup PreviewNvim
        au!
        autocmd BufWrite,FileWrite <buffer> call preview#send_current_buf()
      augroup END
    endif
  endif
  augroup PreviewFileChange
    au!
    au BufEnter,WinEnter,BufWinEnter,TabEnter *.md call preview#send_current_buf()
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
    echo 'Preview.vim supports "default" or "default_dark" theme option'
  endif
endfunction

function preview#auto_browser_open() abort
  if exists('g:preview_open_cmd')
    call system(g:preview_open_cmd . ' http://localhost:3000/markdown')
  endif
endfunction

function preview#send_cursor_linenum() abort
  if g:preview_server_started
    let cursor_linenum = getcurpos()[1]
    call denops#request('preview', 'send_cursor_linenum', [cursor_linenum])
  endif
endfunction

function preview#notification(msg) abort
  let b:preview_notification_msg = a:msg
  if has('nvim')
    if exists('g:preview_enable_notify')
      if g:preview_enable_notify
        lua require("notify")('Preview.vim: ' .. vim.b.preview_notification_msg)
      endif
    else
      echo '[Preview.vim] ' . a:msg
    endif
  else
    echo '[Preview.vim] ' . a:msg
  endif
endfunction
