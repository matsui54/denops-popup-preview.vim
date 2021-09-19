local vim = vim
local api = vim.api

local is_new_handler = function(arg)
  -- For neovim 0.6 breaking changes
  -- https://github.com/neovim/neovim/pull/15504
  return vim.fn.has('nvim-0.6') and type(arg) == 'table'
end

local respond = function(item)
  api.nvim_call_function('denops#notify', {'popup_preview', 'respond', {item}})
end

local get_resolved_item = function(arg)
  local item = arg.decoded
  vim.lsp.buf_request(0, 'completionItem/resolve', item, function(_, arg1, arg2)
    local res = is_new_handler(arg1) and arg1 or arg2
    if res then
    -- print(vim.inspect(res))
      respond({item = res, selected = arg.selected})
    end
  end)
end

return {
  get_resolved_item = get_resolved_item,
}
