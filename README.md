# tree-sitter-ghp

[tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for [GHP](https://github.com/GHP-GoLang-Framework/ghp) — HTML with `<go .../>` tags that embed real Go.

Consumed by the [Zed extension](https://github.com/GHP-GoLang-Framework/ghp-zed); the [VSCode extension](https://github.com/GHP-GoLang-Framework/ghp-vscode) uses a separate TextMate grammar instead, since VSCode highlighting is regex-based.

## What it recognizes

Every GHP tag becomes its own node, with the embedded Go captured as a `go_code` node (`content` field) meant to be injected with a real Go grammar rather than parsed here:

| Node | Source |
| --- | --- |
| `import_tag` | `<go:import (...)/>` |
| `control_tag` | `<go:if/>`, `<go:elif/>`, `<go:else/>`, `<go:switch/>`, `<go:case/>`, `<go:default/>`, `<go:for/>` |
| `close_tag` | `<go:endif/>`, `<go:endswitch/>`, `<go:endfor/>` |
| `echo_tag` | `<go= expr/>` |
| `statement_tag` | `<go .../>` |
| `text` | everything else (plain HTML) |

**Known limitation** (shared with the TextMate grammar): a tag closes at the first bare `>`, so a Go comparison like `<go:if a > b/>` closes early — this is an ambiguity in the GHP syntax itself, not a grammar bug. Write `b < a` or move the comparison into a preceding `<go .../>` block instead.

## Development

```bash
npm install
npm run generate   # regenerates src/ from grammar.js
npm test           # runs test/corpus against the generated parser
```

`src/parser.c`, `src/node-types.json`, and `src/grammar.json` are generated and committed — consumers (like Zed) build the WASM parser straight from them, they don't run `tree-sitter generate` themselves.
