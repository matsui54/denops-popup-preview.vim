import { assertEquals } from "./deps.ts";
import { Config, makeConfig } from "./config.ts";

Deno.test("test makeConfig", () => {
  const userconfig: unknown = {
    documentation: {
      enable: false,
      winblend: 10,
    },
    signature: {
      enable: true,
      border: "double",
      maxWidth: 100,
    },
  };
  assertEquals(makeConfig(userconfig as Config), {
    documentation: {
      enable: false,
      border: "single",
      maxWidth: 80,
      maxHeight: 30,
      supportVsnip: true,
      supportInfo: true,
      delay: 30,
      winblend: 10,
    },
    signature: {
      enable: true,
      border: "double",
      maxWidth: 100,
      maxHeight: 10,
    },
  });
});
