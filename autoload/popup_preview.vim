let s:root_dir = fnamemodify(expand('<sfile>'), ':h:h')
let s:is_enabled = 0

function! popup_preview#enable() abort
  if denops#plugin#is_loaded('ddc_nvim_lsp_doc')
    return
  endif
  let s:is_enabled = 1

  augroup PopupPreview
    autocmd!
  augroup END

  if exists('g:loaded_denops') && denops#server#status() ==# 'running'
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

function! s:denops_running() abort
  return exists('g:loaded_denops')
        \ && denops#server#status() ==# 'running'
        \ && denops#plugin#is_loaded('ddc')
endfunction

function! popup_preview#notify(method, arg) abort
  if s:denops_running()
    call denops#notify('popup_preview', a:method, a:arg)
  endif
endfunction

function! popup_preview#scroll(count) abort
  call popup_preview#doc#scroll(a:count)
  return "\<Ignore>"
endfunction
