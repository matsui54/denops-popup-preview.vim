import { batch, Denops, fn, op } from "./deps.ts";
import {
  CompleteInfo,
  CompletionItem,
  FloatOption,
  PopupPos,
} from "./types.ts";
import { DocConfig } from "./config.ts";
import { getLspContents, searchUserdata } from "./integ.ts";
import { stylizeMarkdown } from "./markdown.ts";

export class DocHandler {
  private bufnr: number;

  private async showFloating(
    denops: Denops,
    lines: string[],
    syntax: string,
    config: DocConfig,
  ) {
    const pumInfo = await denops.call("pum_getpos") as PopupPos;
    if (!pumInfo || !pumInfo.col) {
      this.closeWin(denops);
      return;
    }

    const col = pumInfo.col + pumInfo.width + (pumInfo.scrollbar ? 1 : 0);
    const maxWidth = Math.min(
      await op.columns.get(denops) - col,
      config.maxWidth,
    );
    const maxHeight = Math.min(
      await denops.eval("&lines") as number - pumInfo.row,
      config.maxHeight,
    );
    const floatingOpt: FloatOption = {
      row: pumInfo.row + 1,
      col: col + 1,
      border: config.border,
    };
    const opts = {
      syntax: syntax,
      lines: lines,
      floatOpt: floatingOpt,
      events: ["InsertLeave", "CursorMovedI"],
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      blend: config.winblend,
    };
    const bufnr = await denops.call("popup_preview#doc#get_buffer") as number;
    await fn.deletebufline(denops, bufnr, 1, '$');
    if (opts.syntax == "markdown") {
      await stylizeMarkdown(denops, bufnr, opts.lines, {
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        separator: "",
      });
    } else {
      await fn.setbufline(denops, bufnr, 1, opts.lines);
      if (opts.syntax) {
        await fn.setbufvar(denops, bufnr, "&syntax", opts.syntax);
      }
    }
    await denops.call("popup_preview#doc#show_floating", opts);
  }

  async showCompleteDoc(
    denops: Denops,
    config: DocConfig,
  ): Promise<void> {
    if (!config.enable) return;
    const info = await fn.complete_info(denops, [
      "mode",
      "selected",
      "items",
    ]) as CompleteInfo;
    if (
      info["mode"] != "eval" ||
      info["selected"] == -1
    ) {
      this.closeWin(denops);
      return;
    }
    const item = info["items"][info["selected"]];
    const maybe = await searchUserdata(denops, item, config);
    if (!maybe) {
      this.closeWin(denops);
      return;
    }
    this.showFloating(denops, maybe.lines, maybe.syntax, config);
  }

  async showLspDoc(denops: Denops, item: CompletionItem, config: DocConfig) {
    const maybe = getLspContents(item, await op.filetype.getLocal(denops));
    if (!maybe) return;
    this.showFloating(denops, maybe.lines, maybe.syntax, config);
  }

  async closeWin(denops: Denops) {
    await denops.call(
      "popup_preview#doc#close_floating",
      {},
    );
  }
}
