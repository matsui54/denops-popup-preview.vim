let s:is_enabled = 0

function! popup_preview#enable() abort
  let s:is_enabled = 1
  call s:register_autocmd()
  call s:init_highlight()
endfunction

function! popup_preview#disable() abort
  let s:is_enabled = 0
  augroup PopupPreview
    autocmd!
  augroup END
endfunction

function! popup_preview#is_enabled() abort
  return s:is_enabled
endfunction

function s:register_autocmd() abort
  augroup PopupPreview
    autocmd!
    autocmd CompleteChanged * 
          \ call popup_preview#notify('onCompleteChanged', [])
    autocmd User PumCompleteChanged
          \ call popup_preview#notify('onCompleteChanged', [])
    autocmd InsertEnter * 
          \ call popup_preview#notify('onInsertEnter', [])

    autocmd TextChangedI * 
          \ if !popup_preview#pum#skip() && !popup_preview#pum#visible() |
          \   call popup_preview#doc#close_floating() |
          \ endif
    autocmd CompleteDone,InsertLeave * 
          \ call popup_preview#doc#close_floating()
    autocmd User PumCompleteDone call popup_preview#doc#close_floating()

    autocmd ColorScheme * call <SID>init_highlight()
  augroup END
endfunction

function! s:init_highlight() abort
  highlight default link PopupPreviewDocument NormalFloat
  highlight default link PopupPreviewBorder NormalFloat
endfunction

function! popup_preview#notify(method, arg) abort
  if denops#plugin#wait('popup_preview')
    return
  endif
  call denops#notify('popup_preview', a:method, a:arg)
endfunction

function! popup_preview#scroll(count) abort
  call popup_preview#doc#scroll(a:count)
  return "\<Ignore>"
endfunction
