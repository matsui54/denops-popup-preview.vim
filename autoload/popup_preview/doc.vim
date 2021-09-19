let s:Buffer = vital#popup_preview#import('VS.Vim.Buffer')
let s:FloatingWindow = vital#popup_preview#import('VS.Vim.Window.FloatingWindow')
let s:Window = vital#popup_preview#import('VS.Vim.Window')

let s:win = s:FloatingWindow.new()
call s:win.set_var('&wrap', 1)
call s:win.set_var('&conceallevel', 2)
call s:win.set_var('&breakindent', 1)
call s:win.set_var('&linebreak', 1)
call s:win.set_var("&foldenable", 0)

function! s:ensure_buffer() abort
  if !bufexists(s:win.get_bufnr())
    call s:win.set_bufnr(s:Buffer.create())
    call setbufvar(s:win.get_bufnr(), '&buftype', 'nofile')
    call setbufvar(s:win.get_bufnr(), '&buflisted', 0)
    call setbufvar(s:win.get_bufnr(), '&swapfile', 0)
  endif
endfunction

function! popup_preview#doc#close_floating(opts) abort
  call s:win.close()
endfunction

function! popup_preview#doc#get_winid() abort
  return s:win.get_winid()
endfunction

" lines: string[]
function! popup_preview#doc#set_buffer(opts) abort
  call s:ensure_buffer()
  let bufnr = s:win.get_bufnr()
  call setbufline(bufnr, 1, a:opts.lines)
  call setbufvar(bufnr, '&modified', 0)
  call setbufvar(bufnr, '&bufhidden', 'hide')
  return bufnr 
endfunction

" floatOpt: FloatOption;
" events: autocmd.AutocmdEvent[];
" width: number;
" height: number;
" cmds: string[]
function! popup_preview#doc#show_floating(opts) abort
  if getcmdwintype() !=# '' || !pumvisible()
    call s:win.close()
    return -1
  endif
  let opts = a:opts
  " call s:ensure_buffer()
  call popup_preview#doc#set_buffer(opts)

  let win_opts = opts.floatOpt
  let win_opts.width = opts.width
  let win_opts.height = opts.height

  call s:win.open(win_opts)
  if has_key(opts, 'cmds') && len(opts.cmds)
    call s:Window.do(s:win.get_winid(), { -> execute(join(opts.cmds, "\n"), 'silent') })
  endif

  if has('nvim')
    call s:win.set_var('&winhighlight', 'NormalFloat:DdcNvimLspDocDocument,FloatBorder:DdcNvimLspDocBorder')
  endif
  if len(opts.events)
    execute printf("autocmd %s <buffer> ++once call popup_preview#doc#close_floating({})",
          \ join(opts.events, ','))
  endif
  return s:win.get_winid()
endfunction
