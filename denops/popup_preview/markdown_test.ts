import { assertEquals } from "./deps.ts";
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

Deno.test("getHighlights", () => {
  assertEquals(
    getHighlights([
      "hoge",
      "```c",
      "int a = 1",
      "a=20",
      "```",
      "print",
      "```python",
      "a = 10",
      "```",
    ]),
    [[
      "hoge",
      "int a = 1",
      "a=20",
      "print",
      "a = 10",
    ], [{
      ft: "c",
      start: 2,
      finish: 3,
    }, {
      ft: "python",
      start: 5,
      finish: 5,
    }]],
  );
});

Deno.test("getMarkdownFences", () => {
  assertEquals(getMarkdownFences(["ts=typescript", "foo=hoge"]), {
    ts: "typescript",
    foo: "hoge",
  });
});
