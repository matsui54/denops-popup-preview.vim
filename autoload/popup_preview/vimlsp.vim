function s:respond(selected, data) abort
  if lsp#client#is_error(a:data) || !has_key(a:data, 'response') || !has_key(a:data['response'], 'result')
    return
  endif

  call popup_preview#notify('respond', [{"item": a:data.response.result, "selected": a:selected}])
endfunction
function popup_preview#vimlsp#resolve(arg) abort
  let item = a:arg.item

  call lsp#send_request(item.server_name, {
    \ 'method': 'completionItem/resolve',
    \ 'params': item.completion_item,
    \ 'on_notification': function('s:respond', [a:arg.selected]),
    \ })
endfunction
