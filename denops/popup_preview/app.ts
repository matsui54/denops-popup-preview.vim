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

  await handler.getConfig(denops);
  registerAutocmd(denops);

  const [hldoc, hlborder] = await gather(denops, async (denops) => {
    await fn.hlexists(denops, "PopupPreviewDocument");
    await fn.hlexists(denops, "PopupPreviewBorder");
  }) as [boolean, boolean];
  await batch(denops, async (denops) => {
    await vars.g.set(denops, "popup_preview#_initialized", 1);
    if (!hldoc) {
      await denops.cmd("highlight link PopupPreviewDocument NormalFloat");
    }
    if (!hlborder) {
      await denops.cmd("highlight link PopupPreviewBorder NormalFloat");
    }
  });
}
