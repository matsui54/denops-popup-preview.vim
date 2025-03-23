local vim = vim
local api = vim.api

local is_new_handler = function(arg)
  -- For neovim 0.6 breaking changes
  -- https://github.com/neovim/neovim/pull/15504
  return vim.fn.has('nvim-0.6') and type(arg) == 'table'
end

local respond = function(item)
  api.nvim_call_function('popup_preview#notify', {'respond', {item}})
end

local get_resolved_item = function(arg)
  local item = arg.decoded
  -- ignore E5018: Some language server make boolean a key of CompletionItem
  pcall(vim.lsp.buf_request_all, 0, 'completionItem/resolve', item, function(_, arg1, arg2)
    local res = is_new_handler(arg1) and arg1 or arg2
    if res and not vim.tbl_isempty(res) then
      respond({item = res, selected = arg.selected})
    else
      api.nvim_call_function("popup_preview#doc#close_floating", {})
    end
  end)
end

return {
  get_resolved_item = get_resolved_item,
}
