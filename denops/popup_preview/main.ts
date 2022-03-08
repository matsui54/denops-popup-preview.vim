import { Denops } from "./deps.ts";
import { DocResponce, EventHandler } from "./event.ts";

export function main(denops: Denops) {
  const handler = new EventHandler();

  denops.dispatcher = {
    onCompleteChanged(): void {
      handler.onCompleteChanged(denops);
    },
    onInsertEnter(): void {
      handler.onInsertEnter(denops);
    },
    onInsertLeave(): void {
      handler.onInsertLeave(denops);
    },
    async respond(arg1: unknown): Promise<void> {
      await handler.onDocResponce(denops, arg1 as DocResponce);
    },
  };
}
