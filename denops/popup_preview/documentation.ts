import { batch, Denops, fn, op, vars } from "./deps.ts";
import {
  CompleteInfo,
  CompletionItem,
  FloatOption,
  PopupPos,
} from "./types.ts";
import { Config } from "./config.ts";
import { getLspContents, searchUserdata } from "./integ.ts";
import { getHighlights, makeFloatingwinSize } from "./markdown.ts";

export class DocHandler {
  private async showFloating(
    denops: Denops,
    lines: string[],
    syntax: string,
    config: Config,
  ) {
    const pumInfo = await denops.call("popup_preview#pum#get_pos") as PopupPos;
    if (!pumInfo || !pumInfo.col) {
      this.closeWin(denops);
      return;
    }

    const displayWidth = await op.columns.get(denops);
    const rightCol = pumInfo.col + pumInfo.width + (pumInfo.scrollbar ? 1 : 0);
    const leftCol = pumInfo.col;

    const maxHeight = Math.min(
      await denops.eval("&lines") as number - pumInfo.row,
      config.maxHeight,
    );
    const [width, _height] = await makeFloatingwinSize(
      denops,
      lines,
      config.maxWidth,
      maxHeight,
      config.border,
    );
    let maxWidth: number;
    let align: "right" | "left";
    if (
      displayWidth - rightCol < width && displayWidth - rightCol < leftCol
    ) {
      maxWidth = leftCol;
      align = "left";
    } else {
      // right align
      maxWidth = Math.min(
        displayWidth - rightCol,
        config.maxWidth,
      );
      align = "right";
    }
    const hiCtx = await getHighlights(denops, lines, {
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      separator: "",
      syntax: syntax,
      border: config.border,
    });
    const floatingOpt: FloatOption = {
      row: pumInfo.row + 1,
      col: align == "right"
        ? rightCol + 1
        : leftCol - hiCtx.width - (config.border ? 2 : 0),
      border: config.border,
    };

    await denops.call(
      "popup_preview#doc#show_floating",
      {
        lines: hiCtx.stripped,
        floatOpt: floatingOpt,
        events: ["InsertLeave"],
        width: hiCtx.width,
        height: hiCtx.height,
        syntax: syntax,
        winblend: config.winblend,
      },
    ) as number;
  }

  async showCompleteDoc(
    denops: Denops,
    config: Config,
  ): Promise<void> {
    const info = await denops.call("popup_preview#pum#info") as CompleteInfo;
    if (
      // info["mode"] != "eval" ||
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
