import { batch, Denops, fn, op, vars } from "./deps.ts";
import {
  CompleteInfo,
  CompletionItem,
  FloatOption,
  PopupPos,
} from "./types.ts";
import { Config } from "./config.ts";
import { getLspContents, searchUserdata } from "./integ.ts";
import { getHighlights } from "./markdown.ts";

export class DocHandler {
  private async showFloating(
    denops: Denops,
    lines: string[],
    syntax: string,
    config: Config,
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

    const hiCtx = await getHighlights(denops, lines, {
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      separator: "",
      syntax: syntax,
      border: config.border,
    });
    await denops.call(
      "popup_preview#doc#show_floating",
      {
        lines: hiCtx.stripped,
        floatOpt: floatingOpt,
        events: ["InsertLeave", "CursorMovedI"],
        width: hiCtx.width,
        height: hiCtx.height,
        syntax: syntax,
      },
    ) as number;
  }

  async showCompleteDoc(
    denops: Denops,
    config: Config,
  ): Promise<void> {
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
    if ("close" in maybe) {
      if (maybe.close) this.closeWin(denops);
      return;
    }
    this.showFloating(denops, maybe.lines, maybe.syntax, config);
  }

  async showLspDoc(denops: Denops, item: CompletionItem, config: Config) {
    const maybe = getLspContents(item, await op.filetype.getLocal(denops));
    if ("close" in maybe) return;
    this.showFloating(denops, maybe.lines, maybe.syntax, config);
  }

  async closeWin(denops: Denops) {
    await denops.call(
      "popup_preview#doc#close_floating",
      {},
    );
  }
}
