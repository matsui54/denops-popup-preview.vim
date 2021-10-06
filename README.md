# denops-popup-preview.vim
Show completion documentation


https://user-images.githubusercontent.com/63794197/136235769-02cf8fca-0e67-440e-9986-593ff71666fb.mp4


## features
- works in both Vim and Neovim
- support [pum.vim](https://github.com/Shougo/pum.vim)
- integration with other plugins
  - lsp documentation
    - [vim-lsp](https://github.com/prabirshrestha/vim-lsp)
    - [ddc-nvim-lsp](https://github.com/Shougo/ddc-nvim-lsp)
  - vsnip snippets
  - ultisnips snippets
  - `info` data of Vim completion item

If you want to add integration with other plugins, please create issue and let me know.

## Required

### denops.vim
https://github.com/vim-denops/denops.vim

## Install
Use your favorite plugin manager.

## Configuration
For detail, please see [help](doc/popup_preview.txt).
``` vim
call popup_preview#enable()
```
