import { autocmd, batch, Denops, fn, gather, vars } from "./deps.ts";
import { DocResponce, EventHandler } from "./event.ts";

export async function main(denops: Denops) {
  const handler = new EventHandler();

  denops.dispatcher = {
    async enable(_): Promise<void> {
      await registerAutocmd(denops);
    },

    async onEvent(arg1: unknown): Promise<void> {
      const event = arg1 as autocmd.AutocmdEvent;
      if (event == "ColorScheme") {
        await initializeHighlight(denops);
        return;
      }
      await handler.onEvent(denops, event);
    },

    async respond(arg1: unknown): Promise<void> {
      await handler.onDocResponce(denops, arg1 as DocResponce);
    },
  };

  async function registerAutocmd(denops: Denops): Promise<void> {
    await autocmd.group(
      denops,
      "PopupPreview",
      (helper: autocmd.GroupHelper) => {
        helper.remove("*");
        for (
          const event of [
            "CompleteChanged",
            "InsertEnter",
            "TextChangedI",
          ] as autocmd.AutocmdEvent[]
        ) {
          helper.define(
            event,
            "*",
            `call popup_preview#notify('onEvent', ["${event}"])`,
          );
        }
        helper.define(
          "User",
          "PumCompleteChanged",
          "call popup_preview#notify('onEvent', ['PumCompleteChanged'])",
        );
      },
    );
  }

  async function initializeHighlight(denops: Denops): Promise<void> {
    await batch(denops, async (denops) => {
      await denops.cmd(
        "highlight default link PopupPreviewDocument NormalFloat",
      );
      await denops.cmd("highlight default link PopupPreviewBorder NormalFloat");
    });
  }

  await handler.getConfig(denops);
  await registerAutocmd(denops);
  await initializeHighlight(denops);

  await autocmd.group(
    denops,
    "PopupPreview-hl",
    (helper: autocmd.GroupHelper) => {
      helper.remove("*");
      helper.define(
        "ColorScheme",
        "*",
        `call popup_preview#notify('onEvent', ["ColorScheme"])`,
      );
    },
  );
}
