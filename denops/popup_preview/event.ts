import { Denops, vars } from "./deps.ts";
import { CompletionItem } from "./types.ts";
import { DocHandler } from "./documentation.ts";
import { Config, makeConfig } from "./config.ts";

export type DocResponce = {
  item: CompletionItem;
  selected: number;
};

export class EventHandler {
  private config: Config = {} as Config;
  private docHandler = new DocHandler();
  private docTimer = 0;

  async getConfig(denops: Denops): Promise<void> {
    const users = await vars.g.get(
      denops,
      "popup_preview_config",
      {},
    ) as Config;
    this.config = makeConfig(users);
  }

  async onInsertEnter(denops: Denops): Promise<void> {
    this.docHandler.clearCache();
    await this.getConfig(denops);
  }

  onCompleteChanged(denops: Denops): void {
    // debounce
    clearTimeout(this.docTimer);
    this.docTimer = setTimeout(async () => {
      await this.docHandler.showCompleteDoc(denops, this.config);
    }, this.config.delay);
  }

  async onDocResponce(denops: Denops, arg: DocResponce) {
    await this.docHandler.onResponce(
      denops,
      arg,
      this.config,
    );
  }
}
