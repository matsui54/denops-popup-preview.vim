let s:root_dir = fnamemodify(expand('<sfile>'), ':h:h')
let s:is_enabled = 0

function! popup_preview#enable() abort
  let s:is_enabled = 1
  if exists('g:popup_preview#_initialized')
    call denops#notify('popup_preview', 'enable', [])
    return
  endif

  augroup PopupPreview
    autocmd!
  augroup END

  if exists('g:loaded_denops')
    silent! call s:register()
  else
    autocmd PopupPreview User DenopsReady silent! call s:register()
  endif
endfunction

function! popup_preview#disable() abort
  let s:is_enabled = 0
  augroup PopupPreview
    autocmd!
  augroup END
endfunction

function! s:register() abort
  call denops#plugin#register('popup_preview',
        \ denops#util#join_path(s:root_dir, 'denops', 'popup_preview', 'app.ts'))
endfunction

function! popup_preview#is_enabled() abort
  return s:is_enabled
endfunction
