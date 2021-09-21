import { autocmd } from "./deps.ts";
export type VimCompleteItem = {
  word: string;
  abbr?: string;
  menu?: string;
  info?: string;
  kind?: string;
  "user_data"?: unknown;
};

export type CompleteInfo = {
  mode: string;
  selected: number;
  items: VimCompleteItem[];
};

export type UserData = JsonUserData | string;

export type JsonUserData = DdcLspData | VsnipData | null;

export type DdcLspData = {
  lspitem: CompletionItem;
};

export type VimLspData = {
  "completion_item"?: CompletionItem;
  "server_name": string;
} | undefined;

export type VsnipData = {
  vsnip: {
    "snippet": string[];
  };
};

export type UltisnipsData = {
  ultisnips: {
    location: string;
    description: string;
  };
};

export type CompletionItem = {
  detail?: string;
  documentation?: string | MarkupContent;
};

export type MarkupContent = {
  kind: MarkupKind;
  value: string;
};
export type MarkupKind = "plaintext" | "markdown";

export type PopupPos = {
  height: number;
  width: number;
  row: number;
  col: number;
  size: number;
  scrollbar: boolean;
};

export type Border =
  | "none"
  | "single"
  | "double"
  | "rounded"
  | "solid"
  | "shadow";

export type FloatOption = {
  width?: number;
  height?: number;
  row?: number;
  col?: number;
  border?: boolean;
};

export type OpenFloatOptions = {
  syntax: string;
  lines: string[];
  floatOpt: FloatOption;
  events: autocmd.AutocmdEvent[];
  maxWidth: number;
  maxHeight: number;
  blend?: number;
};
