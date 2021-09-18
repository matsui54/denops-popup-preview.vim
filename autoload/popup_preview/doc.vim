let s:Buffer = vital#popup_preview#import('VS.Vim.Buffer')
let s:MarkupContent = vital#popup_preview#import('VS.LSP.MarkupContent')
let s:Markdown = vital#popup_preview#import('VS.Vim.Syntax.Markdown')
let s:FloatingWindow = vital#popup_preview#import('VS.Vim.Window.FloatingWindow')

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

function! popup_preview#doc#get_buffer() abort
  call s:ensure_buffer()
  return s:win.get_bufnr()
endfunction
" syntax: string;
" lines: string[];
" floatOpt: FloatOption;
" events: autocmd.AutocmdEvent[];
" maxWidth: number;
" maxHeight: number;
function! popup_preview#doc#show_floating(opts) abort
  if getcmdwintype() !=# '' || !pumvisible()
    call s:win.close()
    return
  endif
  let opts = a:opts
  call s:ensure_buffer()

  let bufnr = s:win.get_bufnr()
  " call setbufline(bufnr, 1, opts.lines)
  " if opts.syntax == 'markdown'
  "   silent! call s:Buffer.do(bufnr, { -> s:Markdown.apply({ 'text': getline('^', '$') }) })
  " elseif opts.syntax != ''
  "   call setbufvar(bufnr, '&syntax', opts.syntax)
  " endif
  call setbufvar(bufnr, '&modified', 0)
  call setbufvar(bufnr, '&bufhidden', 'hide')

  let size = s:win.get_size({ 'wrap': v:true, 'maxwidth': opts.maxWidth, 'maxheight': opts.maxHeight})
  let win_opts = opts.floatOpt
  let win_opts.width = size.width
  let win_opts.height = size.height

  if has('nvim')
    call s:win.set_var('&winhighlight', 'NormalFloat:DdcNvimLspDocDocument,FloatBorder:DdcNvimLspDocBorder')
  endif

  call s:win.open(win_opts)
  if len(opts.events)
    execute printf("autocmd %s <buffer> ++once call popup_preview#doc#close_floating({})",
          \ join(opts.events, ','))
  endif
endfunction
