import { Denops } from "./deps.ts";
import { DocResponce, EventHandler } from "./event.ts";

export function main(denops: Denops) {
  const handler = new EventHandler();

  denops.dispatcher = {
    async onCompleteChanged(_): Promise<void> {
      await handler.onCompleteChanged(denops);
    },
    async onInsertEnter(_): Promise<void> {
      await handler.onInsertEnter(denops);
    },

    async respond(arg1: unknown): Promise<void> {
      await handler.onDocResponce(denops, arg1 as DocResponce);
    },
  };
}
