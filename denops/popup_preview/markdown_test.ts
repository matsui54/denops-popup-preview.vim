import { assertEquals, test } from "./deps_test.ts";
import { path, vars } from "./deps.ts";
import {
  convertInputToMarkdownLines,
  getHighlights,
  getMarkdownFences,
} from "./markdown.ts";

Deno.test("convertInputToMarkdownLines", () => {
  assertEquals(convertInputToMarkdownLines("hoge\nfoo", ["var"]), [
    "var",
    "hoge",
    "foo",
  ]);
  assertEquals(
    convertInputToMarkdownLines({ kind: "plaintext", value: "hoge\nfoo" }, [
      "var",
    ]),
    [
      "var",
      "<text>",
      "hoge",
      "foo",
      "</text>",
    ],
  );
  assertEquals(
    convertInputToMarkdownLines({ language: "c", value: "hoge\nfoo" }, [
      "var",
    ]),
    [
      "var",
      "```c",
      "hoge",
      "foo",
      "```",
    ],
  );
});

const runtimepath = path.resolve(
  path.fromFileUrl(`${import.meta.url}/../../../..`),
);

console.log("runtimepath", runtimepath);

test({
  mode: "any",
  name: "getHighlights strip code blocks and get highlight items",
  fn: async (denops) => {
    const contents = [
      "hoge",
      "```c",
      "int a = 1",
      "a=20",
      "```",
      "print",
      "```python",
      "a = 10",
      "```",
    ];
    const exp = await getHighlights(denops, contents, {
      maxWidth: 30,
      maxHeight: 30,
      separator: false,
      border: true,
    });
    const dst = {
      stripped: [
        "hoge",
        "int a = 1",
        "a=20",
        "print",
        "a = 10",
      ],
      highlights: [{
        ft: "c",
        start: 2,
        finish: 3,
      }, {
        ft: "python",
        start: 5,
        finish: 5,
      }],
      height: 5,
      width: 9,
    };
    assertEquals(dst, exp);
  },
  prelude: [`set runtimepath^=${runtimepath}`],
});

test({
  mode: "any",
  name: "",
  fn: async (denops) => {
    await vars.g.set(
      denops,
      "markdown_fenced_languages",
      ["ts=typescript", "foo=hoge"],
    );
    const dst = {
      ts: "typescript",
      foo: "hoge",
    };
    const exp = await getMarkdownFences(denops);
    assertEquals(dst, exp);
  },
  prelude: [`set runtimepath^=${runtimepath}`],
});
