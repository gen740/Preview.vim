if exists('g:preview_vim')
    finish
endif

let g:my_custom_plugin = 1
let s:save_cpo = &cpoptions
set cpoptions&vim

if !exists('g:preview_vim_options')
  let g:preview_options = {
        \ 'DEBUG'               : v:false,
        \ 'cursor_sync_mode'    : 'auto',
        \ 'theme'               : 'default_dark',
        \ 'useTyporaTheme'      : 'none',
        \ 'custom_css_ft_list'  : [],
        \ 'custom_css_dict'     : {},
        \ 'math'                : 'Katex',
        \ 'GFM'                 : v:true,
        \ 'plantuml'            : v:false,
        \ 'marmaid'             : v:false,
        \ 'chartjs'             : v:true,
        \ 'emoji'               : v:true,
        \ 'enableRawHTML'       : v:true,
        \ 'port'                : 3000,
        \ 'ws_port'             : 8080,
        \ }
endif

if exists('g:preview_DEBUG')
  let g:preview_options['DEBUG'] = g:preview_DEBUG
endif

if exists('g:preview_theme')
  let g:preview_options['theme'] = g:preview_theme
endif

if !exists('g:preview_math')
  let g:preview_options['math'] = 'Katex'
else
  if g:preview_math ==# 'Katex'
    let g:preview_options['math'] = 'Katex'
  elseif g:preview_math ==# 'none'
    let g:preview_options['math'] = 'none'
  elseif g:preview_math ==# 'MathJax'
    let g:preview_options['math'] = 'MathJax'
  else
    echo 'You cannot set ' . g:preview_math . ' to g:preview_math. set "Katex" or "none"'
  endif
endif

if exists('g:preview_enable_gfm')
  let g:preview_options['GFM'] = g:preview_enable_gfm
endif

if exists('g:preview_enable_emoji')
  let g:preview_options['emoji'] = g:preview_enable_emoji
endif

if exists('g:preview_enable_rawHTML')
  let g:preview_options['enableRawHTML'] = g:preview_enable_rawHTML
endif

if exists('g:preview_enable_plantuml')
  let g:preview_options['plantuml'] = g:preview_enable_plantuml
endif

if exists('g:preview_enable_mermaid')
  let g:preview_options['mermaid'] = g:preview_enable_mermaid
endif

if !exists('g:preview_disable_cursorSync')
  let g:preview_enable_cursorSync = v:true
endif

if !exists('g:preview_enable_bufSync')
  let g:preview_enable_bufSync = v:true
endif

if !exists('g:preview_fast_bufSync')
  let g:preview_fast_bufSync = v:true
endif

if exists('g:preview_custom_ft')
  let g:preview_options['custom_css_ft_list'] = g:preview_custom_ft
endif

if exists('g:preview_custom_css_dict')
  let g:preview_options['custom_css_dict'] = g:preview_custom_css_dict
endif

let g:preview_server_started = v:false

if g:preview_enable_cursorSync
  augroup PreviewSendCUrsorPos
    au!
    autocmd CursorMoved,CursorMovedI *.md call preview#send_cursor_linenum()
    autocmd CursorMoved,CursorMovedI *.txt call preview#send_cursor_linenum()
  augroup END
endif


command PreviewStart call preview#start(&ft)
command PreviewSync call preview#send_current_buf()
" command PreviewStop
" command PreviewOpen

let &cpoptions = s:save_cpo
unlet s:save_cpo
