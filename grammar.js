/**
 * @file GHP grammar for tree-sitter — HTML with <go .../> tags that embed real Go.
 * @author GHP Contributors
 * @license MIT
 */

/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'ghp',

  // Every byte of the source belongs to either a tag or plain text — there
  // is no implicit whitespace to skip between rules, since both `text` and
  // `go_code` already absorb whitespace (including newlines) as part of
  // their own character classes.
  extras: _$ => [],

  rules: {
    document: $ => repeat($._node),

    _node: $ => choice(
      $.import_tag,
      $.close_tag,
      $.control_tag,
      $.echo_tag,
      $.statement_tag,
      $.html_open_tag,
      $.html_close_tag,
      $.html_self_closing_tag,
      $.html_comment,
      $.html_doctype,
      $.text,
    ),

    // Runs of plain HTML/text between tags. The single '<' fallback lets a
    // literal that isn't a real GHP tag (e.g. `<google-ad>` or a stray '<'
    // in HTML) fall back to being consumed as text, one character at a
    // time, rather than blocking the parse — real tag tokens are always
    // longer, so they win via longest-match wherever they actually apply.
    text: $ => token(prec(-1, choice(/[^<]+/, /</))),

    // ── GHP tags (higher priority to win over HTML) ────────────────────

    // <go:import ("fmt")/> — one or more Go imports. ':' immediately after
    // "go" already rules out any real HTML tag name, so this needs no
    // extra boundary check (tree-sitter's regex engine has no
    // look-around, unlike the TextMate grammar this mirrors).
    import_tag: $ => seq(
      $.import_start,
      field('content', $.go_code),
      '>',
    ),
    import_start: _$ => prec(2, '<go:import'),

    // <go:endif/>, <go:endswitch/>, <go:endfor/> — closes a block tag.
    close_tag: $ => seq(
      $.close_start,
      field('content', $.go_code),
      '>',
    ),
    close_start: _$ => prec(2, choice('<go:endif', '<go:endswitch', '<go:endfor')),

    // <go:if/>, <go:elif/>, <go:else/>, <go:switch/>, <go:case/>,
    // <go:default/>, <go:for/> — control structures. `else` and `default`
    // carry no meaningful expression, the rest take real Go.
    control_tag: $ => seq(
      $.control_start,
      field('content', $.go_code),
      '>',
    ),
    control_start: _$ => prec(2, choice(
      '<go:if', '<go:elif', '<go:else', '<go:switch', '<go:case', '<go:default', '<go:for',
    )),

    // <go= expression/> — renders the expression's value, HTML-escaped.
    echo_tag: $ => seq(
      $.echo_start,
      field('content', $.go_code),
      '>',
    ),
    echo_start: _$ => prec(2, '<go='),

    // <go .../> — a block of Go code (statement), possibly multi-line.
    // Unlike the other four, "go" alone isn't a unique enough prefix (it
    // collides with a real tag like `<google-ad>`), so the boundary
    // character right after it is folded into this token and restricted
    // to whitespace or the self-closing '/' — the only two ways a real
    // statement tag is ever written.
    statement_tag: $ => seq(
      $.statement_start,
      field('content', $.go_code),
      '>',
    ),
    statement_start: _$ => token(prec(2, seq('<go', /[ \t\r\n\/]/))),

    // The Go payload of a tag: everything up to the tag's closing '>',
    // always at least one character because every real tag ends in '/>'
    // (the trailing '/' becomes the tail of this token). A bare '>' inside
    // a Go expression (e.g. `a > b`) closes the tag early — a known
    // ambiguity of the syntax itself, not a grammar bug; see the VSCode
    // extension's README for the same documented limitation.
    go_code: _$ => token(prec(-1, /[^>]+/)),

    // ── HTML tags ──────────────────────────────────────────────────────

    // <div class="foo"> — opening HTML tag with optional attributes.
    html_open_tag: $ => token(/<[a-zA-Z][a-zA-Z0-9-]*(\s+[^>]*)?>/),

    // </div> — closing HTML tag.
    html_close_tag: $ => token(/<\/[a-zA-Z][a-zA-Z0-9-]*\s*>/),

    // <br/> or <br /> — self-closing HTML tag.
    html_self_closing_tag: $ => token(prec(1, /<[a-zA-Z][a-zA-Z0-9-]*(\s+[^>]*)?\/>/)),

    // <!-- comment --> — HTML comment.
    html_comment: $ => token(/<!--[^>]*-->/),

    // <!DOCTYPE html> — HTML document type declaration.
    html_doctype: $ => token(/<!DOCTYPE[^>]*>/),
  },
});
