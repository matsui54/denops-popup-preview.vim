import { Denops, op } from "./deps.ts";
import {
  CompletionItem,
  JsonUserData,
  UltisnipsData,
  VimCompleteItem,
} from "./types.ts";
import { DocConfig } from "./config.ts";
import { convertInputToMarkdownLines } from "./markdown.ts";

type DocContents = {
  syntax: string;
  lines: string[];
} | null;

function getUltisnipsSnippets(
  item: UltisnipsData,
): string[] | null {
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
  return text;
}

function getInfoField(
  item: VimCompleteItem,
  config: DocConfig,
): DocContents {
  if (config.supportInfo && item.info && item.info.length) {
    return { syntax: "plaintext", lines: item.info.split("\n") };
  }
  return null;
}

export function getLspContents(
  item: CompletionItem,
  filetype: string,
): DocContents {
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
    return null;
  }
  return { lines: lines, syntax: "markdown" };
}

export async function searchUserdata(
  denops: Denops,
  item: VimCompleteItem,
  config: DocConfig,
): Promise<DocContents> {
  if (!item.user_data) {
    return getInfoField(item, config);
  }
  const filetype = await op.filetype.getLocal(denops);
  let decoded: JsonUserData = null;
  if (typeof item.user_data == "string") {
    try {
      decoded = JSON.parse(item.user_data) as JsonUserData;
    } catch (e) {
      if (e instanceof SyntaxError) {
        decoded = null;
      }
    }
    // plain string
    if (!decoded) {
      return { syntax: "plaintext", lines: item.user_data.split("\n") };
    }
  }

  // neither json nor string
  if (!decoded) {
    return getInfoField(item, config);
  }

  // nvim-lsp + ddc
  if ("lspitem" in decoded) {
    if (decoded.lspitem.documentation) {
      return getLspContents(decoded.lspitem, filetype);
    } else {
      denops.call(
        "luaeval",
        "require('popup_preview.nvimlsp').get_resolved_item(_A.arg)",
        { arg: { decoded: decoded.lspitem } },
      );
      return null;
    }
  }

  // vsnip
  if (config.supportVsnip && "vsnip" in decoded) {
    return { syntax: filetype, lines: decoded.vsnip.snippet };
  }

  // ddc-ultisnips
  if (config.supportUltisnips && "ultisnips" in decoded) {
    const texts = getUltisnipsSnippets(decoded);
    if (texts) return { syntax: filetype, lines: texts };
    else return null;
  }

  // unknown object. search for info item
  return getInfoField(item, config);
}
