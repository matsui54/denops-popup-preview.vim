function s:respond(data) abort
  if lsp#client#is_error(a:data) || !has_key(a:data, 'response') || !has_key(a:data['response'], 'result')
    return
  endif

  call denops#notify('popup_preview', 'respond', [{"item": a:data.response.result}])
endfunction
function popup_preview#vimlsp#resolve(item) abort
  let item = a:item

  call lsp#send_request(item.server_name, {
    \ 'method': 'completionItem/resolve',
    \ 'params': item.completion_item,
    \ 'on_notification': function('s:respond'),
    \ })
endfunction

