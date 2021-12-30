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

      specify the math rederer. "none", "Katex" or "MathJax"

      :Default: "Katex"

- `g:preview_auto_start`

      0 or 1

      Start the Preview on start.

- `g:preview_open_cmd`

      Set the Broweser open command

      forexample "let g:preview_open_cmd = 'open -a Safari'"

- `g:preview_enable_gfm`

      0 or 1

      enable Github Flavor Markdown (table, link .etc)

      :Default: 1

- `g:preview_enable_emoji`

      0 or 1

      enable Emoji

      :Default: 1

- `g:preview_enable_rawHTML` 

      0 or 1

      enable rawHTML tag in Markdown

      :Default: 1

- `g:preview_enable_notify`

      0 or 1

      Use nvim-notify to Notification, Need (https://github.com/rcarriga/nvim-notify)
      Plugin

      :Default: 0

- `g:preview_enable_plantuml`

      0 or 1

      enable plantuml in Codeblock

      ```pluntuml
      ```

      :Default: 0

- `g:preview_enable_mermaid`

      0 or 1

      enable mermaid in Codeblock

      ```mermaid
      ```

      :Default: 0
