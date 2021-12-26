if exists('g:preview_vim')
    finish
endif

let g:my_custom_plugin = 1
let s:save_cpo = &cpoptions
set cpoptions&vim

if !exists('g:preview_vim_options')
  let g:preview_options = {
        \ 'cursor_sync_enable' : v:true,
        \ 'filetype': 'markdown',
        \ 'theme': 'default_dark',
        \ 'custom_css_dir': v:false,
        \ 'math': 'katex',
        \ 'port': 3000,
        \ 'ws_port': 8080,
        \ }
endif

if !exists('g:preview_theme')
  let g:preview_options['theme'] = 'default'
else
  let g:preview_options['theme'] = g:preview_theme
endif

if !exists('g:preview_math')
  let g:preview_options['math'] = 'katex'
else
  if g:preview_math ==# 'katex'
    let g:preview_options['math'] = 'katex'
  elseif g:preview_math ==# 'none'
    let g:preview_options['math'] = 'none'
  else
    echo 'You cannot set ' . g:preview_math . ' to g:preview_math. set "katex" or "none"'
  endif
endif

" AutoStart Options

if !exists('g:preview_filetypes')
  let g:preview_filetypes = 'markdown'
endif

let g:preview_server_started = v:false
" g:preview_enable_cursor_sync
" g:preview_theme " default/ default_dark
" g:preview_custom_css_dir
" let g:preview_math = ''
" Set all options

command PreviewStart call preview#start()
" command PreviewSync
" command PreviewStop
" command PreviewOpen

autocmd CursorMoved,CursorMovedI,TextChanged,TextChangedI,TextChangedP *.md call preview#send_cursor_linenum()

let &cpoptions = s:save_cpo
unlet s:save_cpo
