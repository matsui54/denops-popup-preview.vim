import { Denops, op } from "./deps.ts";
import { CompleteInfo, FloatOption, PopupPos } from "./types.ts";
import { Config } from "./config.ts";
import { getLspContents, searchUserdata } from "./integ.ts";
import { getStylizeCommands, makeFloatingwinSize } from "./markdown.ts";
import { DocResponce } from "./event.ts";

type DocCache = {
  lines: string[];
  index: number;
};

export class DocHandler {
  private docCache: Record<string, DocCache> = {};

  clearCache() {
    this.docCache = {};
  }

  private async showFloating(
    denops: Denops,
    lines: string[],
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
    if (maxWidth < 1) {
      this.closeWin(denops);
      return;
    }

    const hiCtx = await getStylizeCommands(denops, lines, {
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      separator: false,
      border: config.border,
    });
    const floatingOpt: FloatOption = {
      row: pumInfo.row + 1,
      col: align == "right"
        ? rightCol + 1
        : leftCol - hiCtx.width - (config.border ? 2 : 0),
      border: config.border,
    };

    if (hiCtx.width < 1) {
      this.closeWin(denops);
      return;
    }
    await denops.call(
      "popup_preview#doc#show_floating",
      {
        lines: hiCtx.stripped,
        floatOpt: floatingOpt,
        width: hiCtx.width,
        height: hiCtx.height,
        cmds: hiCtx.commands,
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
    const cache = this.docCache[item.abbr || item.word] ?? null;
    if (cache && cache.index == info.selected) {
      this.showFloating(denops, cache.lines, config);
      return;
    }
    const maybe = await searchUserdata(denops, item, config, info.selected);
    if (!maybe.found) {
      this.closeWin(denops);
    }
    if (!maybe.lines || !maybe.lines.length) {
      return;
    }
    this.docCache[item.abbr || item.word] = {
      lines: maybe.lines,
      index: info.selected,
    };
    if (config.debug) {
      console.log({ lines: maybe.lines });
    }
    this.showFloating(denops, maybe.lines, config);
  }

  async onResponce(denops: Denops, res: DocResponce, config: Config) {
    const info = await denops.call("popup_preview#pum#info") as CompleteInfo;
    const maybe = getLspContents(res.item, await op.filetype.getLocal(denops));
    if (!maybe.found) {
      this.closeWin(denops);
    }
    if (!maybe.lines || !maybe.lines.length) {
      return;
    }
    const item = info["items"][res.selected];
    this.docCache[item.abbr || item.word] = {
      lines: maybe.lines,
      index: res.selected,
    };
    if (info.selected != res.selected) {
      return;
    }
    if (config.debug) {
      console.log({ lines: maybe.lines });
    }
    this.showFloating(denops, maybe.lines, config);
  }

  async closeWin(denops: Denops) {
    await denops.call(
      "popup_preview#doc#close_floating",
      {},
    );
  }
}
