; highlights.scm — syntax-highlighting query for tree-sitter-ghp
;
; Supports both GHP template tags and standard HTML.  Go payloads
; (go_code) are left as `@embedded` so that a real Go injection
; grammar can provide intra-tag highlighting in editors that support
; tree-sitter injections (Zed, Neovim, Helix, etc.).

; ── GHP tags ──────────────────────────────────────────────────────────

(import_tag)    @keyword.import
(import_start)  @keyword.import

(control_tag)   @keyword
(control_start) @keyword

(close_tag)     @keyword
(close_start)   @keyword

(echo_tag)      @keyword.return
(echo_start)    @keyword.return

(statement_tag) @keyword
(statement_start) @keyword

(go_code)       @embedded

; ── HTML tags ─────────────────────────────────────────────────────────

(html_open_tag)        @tag
(html_close_tag)       @tag
(html_self_closing_tag) @tag

(html_comment)         @comment
(html_doctype)         @constant.builtin

; ── Default: plain text is not highlighted ────────────────────────────

(text) @none
