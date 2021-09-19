" retrieved code from neovim syntax/lsp_markdown.vim

" execute 'source' expand('<sfile>:p:h') .. '/markdown.vim'
" call s:_execute('runtime! syntax/markdown.vim')
runtime syntax/markdown.vim

syn cluster mkdNonListItem add=mkdEscape,mkdNbsp

syn clear markdownEscape
syntax region markdownEscape matchgroup=markdownEscape start=/\\\ze[\\\x60*{}\[\]()#+\-,.!_>~|"$%&'\/:;<=?@^ ]/ end=/./ containedin=ALL keepend oneline concealends

" conceal html entities
syntax match mkdNbsp /&nbsp;/ conceal cchar= 
syntax match mkdLt /&lt;/  conceal cchar=<
syntax match mkdGt /&gt;/  conceal cchar=>
syntax match mkdAmp /&amp;/  conceal cchar=&
syntax match mkdQuot /&quot;/  conceal cchar="

hi def link mkdEscape special

