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
| `html_open_tag` | `<div class="foo">` |
| `html_close_tag` | `</div>` |
| `html_self_closing_tag` | `<br/>`, `<br />` |
| `html_comment` | `<!-- ... -->` |
| `html_doctype` | `<!DOCTYPE html>` |
| `text` | everything else (plain text between tags) |

GHP tags always take priority over HTML tags — a `<go:if/>` is never mistaken for an HTML element even though `go` is a valid tag name prefix.

**Known limitation** (shared with the TextMate grammar): a tag closes at the first bare `>`, so a Go comparison like `<go:if a > b/>` closes early — this is an ambiguity in the GHP syntax itself, not a grammar bug. Write `b < a` or move the comparison into a preceding `<go .../>` block instead.

## Highlighting

`queries/highlights.scm` provides syntax-highlighting captures for both GHP tags and HTML.  Go payloads inside tags are marked `@embedded` so editors with tree-sitter injection support (Zed, Neovim, Helix) can highlight them with a real Go grammar.

## Development

```bash
npm install
npm run generate   # regenerates src/ from grammar.js
npm test           # runs test/corpus against the generated parser
```

`src/parser.c`, `src/node-types.json`, and `src/grammar.json` are generated and committed — consumers (like Zed) build the WASM parser straight from them, they don't run `tree-sitter generate` themselves.
