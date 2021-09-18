" retrieved code from neovim syntax/lsp_markdown.vim

" execute 'source' expand('<sfile>:p:h') .. '/markdown.vim'
" call s:_execute('runtime! syntax/markdown.vim')
runtime syntax/markdown.vim

syn cluster mkdNonListItem add=mkdEscape,mkdNbsp

syn clear markdownEscape
syntax region markdownEscape matchgroup=markdownEscape start=/\\\ze[\\\x60*{}\[\]()#+\-,.!_>~|"$%&'\/:;<=?@^ ]/ end=/./ containedin=ALL keepend oneline concealends

" conceal html entities
syntax match vital_vs_vim_syntax_markdown_entities_lt /&lt;/ containedin=ALL conceal cchar=<
syntax match vital_vs_vim_syntax_markdown_entities_gt /&gt;/ containedin=ALL conceal cchar=>
syntax match vital_vs_vim_syntax_markdown_entities_amp /&amp;/ containedin=ALL conceal cchar=&
syntax match vital_vs_vim_syntax_markdown_entities_quot /&quot;/ containedin=ALL conceal cchar="
syntax match vital_vs_vim_syntax_markdown_entities_nbsp /&nbsp;/ containedin=ALL conceal cchar= 

hi def link mkdEscape special

