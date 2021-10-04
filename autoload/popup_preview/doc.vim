let s:Buffer = vital#popup_preview#import('VS.Vim.Buffer')
let s:FloatingWindow = vital#popup_preview#import('VS.Vim.Window.FloatingWindow')
let s:Window = vital#popup_preview#import('VS.Vim.Window')
let s:Markdown = vital#popup_preview#import('VS.Vim.Syntax.Markdown')

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
    call setbufvar(s:win.get_bufnr(), '___popup_preview_current_syntax', '')
  endif
endfunction

function! popup_preview#doc#close_floating(opts) abort
  call s:win.close()
endfunction

function! popup_preview#doc#get_winid() abort
  return s:win.get_winid()
endfunction

function! popup_preview#doc#set_buffer(opts) abort
  call s:ensure_buffer()
  let bufnr = s:win.get_bufnr()
  call setbufline(bufnr, 1, a:opts.lines)
  call setbufvar(bufnr, '&modified', 0)
  call setbufvar(bufnr, '&bufhidden', 'hide')
  return bufnr 
endfunction

function! s:apply_syntax(opts) abort
  if a:opts.syntax == b:___popup_preview_current_syntax
    return
  endif
  unlet! b:current_syntax
  unlet! b:___VS_Vim_Syntax_Markdown
  syntax clear
  if a:opts.syntax == 'markdown'
    call s:Markdown.apply({ 'text': a:opts.lines })
  else
    call execute('runtime! syntax/'.a:opts.syntax.'.vim')
  endif
  let b:___popup_preview_current_syntax = a:opts.syntax
endfunction

" floatOpt: FloatOption;
" events: autocmd.AutocmdEvent[];
" width: number;
" height: number;
" syntax: string
function! popup_preview#doc#show_floating(opts) abort
  if getcmdwintype() !=# '' || !popup_preview#pum#visible()
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
  call s:Window.do(s:win.get_winid(), { -> s:apply_syntax(opts) })

  if has('nvim')
    call s:win.set_var('&winhighlight', 'NormalFloat:DdcNvimLspDocDocument,FloatBorder:DdcNvimLspDocBorder')
    if opts.winblend
      call s:win.set_var('&winblend', opts.winblend)
    endif
  endif
  if len(opts.events)
    execute printf("autocmd %s <buffer> ++once call popup_preview#doc#close_floating({})",
          \ join(opts.events, ','))
  endif
  return s:win.get_winid()
endfunction

function! popup_preview#doc#scroll(count) abort
  let ctx = {}
  function! ctx.callback(count) abort
    let info = s:win.info()
    if info is v:null
      return
    endif
    call s:Window.scroll(s:win.get_winid(), info.topline+a:count)
  endfunction
  call timer_start(0, { -> l:ctx.callback(a:count) })
  return "\<Ignore>"
endfunction
