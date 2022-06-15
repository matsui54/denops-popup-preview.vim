import { assertEquals } from "./deps_test.ts";
import { Config, makeConfig } from "./config.ts";

Deno.test("makeConfig merges user config with default", () => {
  const userconfig: unknown = {
    enable: false,
    winblend: 10,
  };
  assertEquals(makeConfig(userconfig as Config), {
    enable: false,
    border: true,
    maxWidth: 80,
    maxHeight: 30,
    supportVsnip: true,
    supportInfo: true,
    supportUltisnips: true,
    delay: 50,
    winblend: 10,
    debug: false,
  });
});
