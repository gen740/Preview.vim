# Preview.vim

Preview Markdown Plugin For Vim/Neovim

This Project is WORK IN PROGRESS.
teth
There might be some big change on future commit ...

## Feature

- Live preview ( fast & realtime sync )
- Light weight

## Dependencies

- npm
- denops

## Installation

- Install with [Packer.nvim](https://github.com/wbthomason/packer.nvim)

```
use({
    "gen740/Preview.vim",
    requires = "vim-denops/denops.vim",
    run = "make install"

})
```

- Install with [vim-plug](https://github.com/junegunn/vim-plug)

```
Plug 'vim-denops/denops.vim'
Plug 'gen740/Preview.vim', { 'do': 'make install' }
```

- Install with [dein](https://github.com/Shougo/dein.vim)

```
call dein#add('vim-denops/denops.vim')
call dein#add('gen740/Preview.vim', { 'build': 'make install' })
```

## How To Use

1. open Markdown File
1. Execute `:PreviewStart`

## Configurations

Default Configuration is following
```vim

let g:preview_theme = "default" " Specify the theme. "default" or "default dark"

let g:previw_math = "Katex" " specify the math rederer. "none", "Katex" or "MathJax"

let g:preview_auto_start = 1  " Start the Preview on start.

let g:preview_open_cmd = "" " Set the Broweser open command
" for example "let g:preview_open_cmd = 'open -a Safari'"

let g:preview_enable_gfm = 1 " enable Github Flavor Markdown (table, link .etc)

let g:preview_enable_emoji = 1 " enable Emoji

let g:preview_enable_rawHTML` = 1 " enable rawHTML tag in Markdown

let g:preview_enable_notify = 0  " Use nvim-notify to Notification

let g:preview_enable_plantuml = 0 " enable plantuml

let g:preview_enable_mermaid = 0 " enable mermaid

```
