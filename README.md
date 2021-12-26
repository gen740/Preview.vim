# PreVeiw.nvim

Preview Markdown Plugin For Vim/Neovim

## Feature

- live preview ( fast realtime sync, you don't have to type ":w" to update preview )
- custom theme ( you can use typora theme, or any other custom theme you like )
- light weight

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

```

## How To Use

1. open Markdown File
1. Execute `:PreviewStart`

## Configurations

## LoadMap

- [x] code Syntax hightlighting
- [x] add Dark/Light Mode
- [x] Katex Support
- [x] auto start
- [x] auto Browser Opeen
- [x] Integrate with nvim-notify
- [ ] Syncronize Cursor -release
- [ ] Add custom css feature
- [ ] support other format (rst, wiki ...)
- [ ] auto server stop
- [ ] "tategaki" mode
- [ ] marmaid or other feature
- [ ] cursor-position option
- [ ] Customizable port
- [ ] support image redering
