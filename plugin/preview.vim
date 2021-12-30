if exists('g:preview_vim')
    finish
endif

let g:my_custom_plugin = 1
let s:save_cpo = &cpoptions
set cpoptions&vim

if !exists('g:preview_vim_options')
  let g:preview_options = {
        \ 'DEBUG'               : v:true,
        \ 'cursor_sync_mode'    : 'auto',
        \ 'theme'               : 'default_dark',
        \ 'useTyporaTheme'      : 'none',
        \ 'custom_css_dir'      : 'none',
        \ 'math'                : 'katex',
        \ 'table'               : v:true,
        \ 'pluntml'             : v:true,
        \ 'marmaid'             : v:true,
        \ 'chartjs'             : v:true,
        \ 'emoji'               : v:true,
        \ 'enableRawHTML'       : v:true,
        \ 'port'                : 3000,
        \ 'ws_port'             : 8080,
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
  elseif g:preview_math ==# 'MathJax'
    let g:preview_options['math'] = 'MathJax'
  else
    echo 'You cannot set ' . g:preview_math . ' to g:preview_math. set "katex" or "none"'
  endif
endif

" AutoStart Options

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
