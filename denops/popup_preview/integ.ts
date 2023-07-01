import { Denops, is, op } from "./deps.ts";
import {
  CompletionItem,
  JsonUserData,
  UltisnipsData,
  VimCompleteItem,
  VimLspData,
} from "./types.ts";
import { Config } from "./config.ts";
import { convertInputToMarkdownLines } from "./markdown.ts";

type SearchResult = {
  lines?: string[];
  found: boolean;
};

function stylizeSnippet(lines: string[]): string {
  lines = lines.flatMap((line) => line.split("\n"));
  return lines.map((line) =>
    line.replace(/\${(\d:)?(\w+)}/g, "$2").replace(/\$(\d)+/g, "$1")
  ).join("\n");
}

function getUltisnipsSnippets(
  item: UltisnipsData,
): string | null {
  const [filePath, lineNr] = item.ultisnips.location.split(":");

  const lines = Deno.readTextFileSync(filePath).split("\n");
  let text: string[] = [];
  for (const line of lines.slice(Number(lineNr))) {
    if (line === "endsnippet" || line.search(/^snippet\s\S+/) != -1) {
      break;
    }
    text = text.concat(line);
  }
  if (!text.length) return null;
  return stylizeSnippet(text);
}

function getInfoField(
  item: VimCompleteItem,
  config: Config,
): SearchResult {
  if (config.supportInfo && item.info && item.info.length) {
    return {
      lines: convertInputToMarkdownLines({
        kind: "plaintext",
        value: item.info,
      }, []),
      found: true,
    };
  }
  return { found: false };
}

export function getLspContents(
  item: CompletionItem,
  filetype: string,
): SearchResult {
  let lines: string[] = [];
  if (item.detail) {
    lines = convertInputToMarkdownLines({
      language: filetype,
      value: item.detail,
    }, []);
  }
  if (item.documentation) {
    const docLines = convertInputToMarkdownLines(item.documentation, []);
    if (lines.length && docLines.length) lines.push("---");
    lines = lines.concat(docLines);
  }

  if (!lines.length) {
    return { found: false };
  }
  return { lines: lines, found: true };
}

export async function searchUserdata(
  denops: Denops,
  item: VimCompleteItem,
  config: Config,
  selected: number,
): Promise<SearchResult> {
  if (!item.user_data) {
    return getInfoField(item, config);
  }
  const filetype = await op.filetype.getLocal(denops);
  let decoded: JsonUserData = null;
  if (is.ObjectOf({ lspitem: is.String })(item.user_data)) {
    decoded = { lspitem: JSON.parse(item.user_data.lspitem) as CompletionItem };
  } else if (typeof item.user_data == "string") {
    try {
      decoded = JSON.parse(item.user_data) as JsonUserData;
    } catch (e) {
      if (e instanceof SyntaxError) {
        decoded = null;
      }
    }
    // plain string
    if (!decoded) {
      return {
        lines: convertInputToMarkdownLines({
          kind: "plaintext",
          value: item.user_data,
        }, []),
        found: true,
      };
    }
  }

  // neither json nor string
  if (!decoded) {
    return getInfoField(item, config);
  }

  // vim-lsp
  if ("vim-lsp/key" in decoded) {
    const lspitem = await denops.call(
      "lsp#omni#get_managed_user_data_from_completed_item",
      item,
    ) as VimLspData;
    if (!lspitem?.completion_item) return { found: false };
    if (lspitem.completion_item.documentation) {
      return getLspContents(lspitem.completion_item, filetype);
    } else {
      await denops.call("popup_preview#vimlsp#resolve", {
        item: lspitem,
        selected: selected,
      });
      return { found: true };
    }
  }

  // nvim-lsp + ddc
  if ("lspitem" in decoded) {
    if (decoded.lspitem.documentation) {
      return getLspContents(decoded.lspitem, filetype);
    } else {
      denops.call(
        "luaeval",
        "require('popup_preview.nvimlsp').get_resolved_item(_A.arg)",
        { arg: { decoded: decoded.lspitem, selected: selected } },
      );
      return { found: true };
    }
  }

  // vsnip
  if (config.supportVsnip && "vsnip" in decoded) {
    return {
      lines: convertInputToMarkdownLines({
        language: filetype,
        value: await denops.call(
          "vsnip#to_string",
          decoded.vsnip.snippet,
        ) as string,
      }, []),
      found: true,
    };
  }

  // ddc-ultisnips
  if (config.supportUltisnips && "ultisnips" in decoded) {
    const texts = getUltisnipsSnippets(decoded);
    if (texts) {
      return {
        lines: convertInputToMarkdownLines({
          language: filetype,
          value: texts,
        }, []),
        found: true,
      };
    } else {
      return { found: false };
    }
  }

  // unknown object. search for info item
  return getInfoField(item, config);
}
