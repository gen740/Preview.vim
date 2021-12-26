# Preview.vim

Preview Markdown Plugin For Vim/Neovim

This Project is WORK IN PROGRESS.
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

- `g:preview_theme`

      Specify the theme. "default" or "default dark"

      :Default: "default"

- `g:previw_math`

      specify the math rederer. "none" or "katex"

      :Default: "katex"

- `g:preview_auto_start`

      0 or 1

      Start the Preview on start.

- `g:preview_open_cmd`

      Set the Broweser open command

      forexample "let g:preview_open_cmd = 'open -a Safari'"
