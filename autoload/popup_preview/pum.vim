function! s:runtimepath(path) abort
  return !empty(globpath(&runtimepath, a:path))
endfunction

let s:has_pum = s:runtimepath('autoload/pum.vim')

function! popup_preview#pum#visible() abort
  if s:has_pum
    return pum#visible() || pumvisible()
  else
    return pumvisible()
  endif
endfunction

function! popup_preview#pum#info() abort
  if s:has_pum && pum#visible()
    return pum#complete_info()
  else
    return complete_info(["mode", "selected", "items"])
  endif
endfunction

function! popup_preview#pum#get_pos() abort
  if s:has_pum && pum#visible()
    let pum = pum#_get()
    return {
          \ 'height': pum.height,
          \ 'width': pum.width,
          \ 'row': pum.pos[0],
          \ 'col': pum.pos[1],
          \ 'scrollbar': v:false,
          \ }
  else
    return pum_getpos()
  endif
endfunction
