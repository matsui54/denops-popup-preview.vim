lint:
	deno lint --unstable denops

test:
	deno test --unstable

format:
	deno fmt denops

.PHONY: lint test format
