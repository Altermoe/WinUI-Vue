// Generate a clean Flutter Dart token file from Fluent tokens.
//
// Paths:
//   - input  (--tokens / env FLUENT_TOKENS / default ../../data/tokens/fluent-tokens.json)
//   - output (--out  / default <script dir>/fluent_tokens.dart)
// Defaults are resolved relative to THIS script's location (portable). Override
// with --tokens / --out (or env vars) when the token file lives elsewhere.
//
// Usage: node gen-dart.js [--tokens <path>] [--out <path>]
const fs = require('fs');
const path = require('path');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const tokensPath = arg('--tokens', process.env.FLUENT_TOKENS)
  || path.join(__dirname, '..', '..', 'data', 'tokens', 'fluent-tokens.json');
const outPath = arg('--out') || path.join(__dirname, 'fluent_tokens.dart');

if (!fs.existsSync(tokensPath)) {
  console.error(
    '[fluent gen-dart] Cannot find Fluent token data at: ' + path.resolve(tokensPath) + '\n' +
    'Provide the real input path with: node gen-dart.js --tokens <path/to/fluent-tokens.json>\n' +
    'The file is produced by installing @fluentui/tokens and running the project\'s token extraction.\n' +
    'See the fluent-adapter-flutter skill "生成/更新" section (if any). Ask a human if the path is unspecified.'
  );
  process.exit(1);
}

const d = require(path.resolve(tokensPath));

function colorExpr(hex) {
  if (typeof hex !== 'string') return `const Color(0x00000000) /* unparsed: ${hex} */`;
  let m = hex.match(/^#([0-9a-fA-F]{6})$/);
  if (m) return `const Color(0xFF${m[1].toUpperCase()})`;
  m = hex.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
  if (m) {
    const a = Math.round(parseFloat(m[4]) * 255);
    const r = Number(m[1]).toString(16).padStart(2, '0').toUpperCase();
    const g = Number(m[2]).toString(16).padStart(2, '0').toUpperCase();
    const b = Number(m[3]).toString(16).padStart(2, '0').toUpperCase();
    return `const Color(0x${a.toString(16).toUpperCase()}${r}${g}${b})`;
  }
  if (hex === 'transparent') return 'const Color(0x00000000)';
  return 'const Color(0x00000000)';
}

const camel = (s) => s.replace(/[-_ ](.)/g, (_, c) => c.toUpperCase());
const lightLines = Object.entries(d.alias.lightWeb)
  .map(([k, v]) => `  static const Color ${k} = ${colorExpr(v)}; // ${v}`);
const darkLines = Object.entries(d.alias.darkWeb)
  .map(([k, v]) => `  static const Color ${k} = ${colorExpr(v)}; // ${v}`);

const sp = d.spacing.horizontal;
const spacingBlock = Object.entries(sp)
  .map(([k, v]) => `  static const double ${k} = ${parseFloat(v)}; // ${v}`).join('\n');

const radiusBlock = Object.entries(d.radius)
  .map(([k, v]) => `  static const double ${k} = ${parseFloat(v || '0')}; // ${v}`).join('\n');

const durBlock = Object.entries(d.durations)
  .map(([k, v]) => `  static const Duration ${k} = Duration(milliseconds: ${parseInt(v)}); // ${v}`).join('\n');

const fts = d.typography.fontSizes;
const fontSizeBlock = Object.entries(fts)
  .map(([k, v]) => `  static const double ${k} = ${parseFloat(v)}; // ${v}`).join('\n');

const fw = d.typography.fontWeights;
const fontWeightBlock = Object.entries(fw)
  .map(([k, v]) => `  static const FontWeight ${k} = FontWeight.w${v}; // ${v}`).join('\n');

const out = `// Fluent 2 design tokens for Flutter, generated from @fluentui/tokens.
// Semantic color constants keep the exact @fluentui/tokens camelCase names.
import 'dart:ui';
import 'dart:ui' show FontWeight;

/// Fluent 2 semantic colors — the light theme (default web brand).
/// Values come straight from @fluentui/tokens alias.lightWeb.
abstract class FluentLightColors {
${lightLines.join('\n')}
}

/// Fluent 2 semantic colors — dark theme.
abstract class FluentDarkColors {
${darkLines.join('\n')}
}

/// Fluent 2 global design tokens (spacing, radius, duration, typography).
abstract class FluentTokens {
  // ---- spacing (4px base scale) ----
${spacingBlock}

  // ---- border radius ----
${radiusBlock}

  // ---- motion duration ----
${durBlock}

  // ---- font sizes ----
${fontSizeBlock}

  // ---- font weights ----
${fontWeightBlock}
}
`;
fs.writeFileSync(path.resolve(outPath), out);
console.log('wrote', path.resolve(outPath), 'lines =', out.split('\n').length, 'light=', lightLines.length, 'dark=', darkLines.length);