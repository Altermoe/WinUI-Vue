// Generate an UnoCSS preset (TypeScript) from Fluent tokens.
// Produces preset-fluent.ts:
//  - cssVars (valid TS object): selector -> { '--TokenName': value }
//  - preflights stringifying cssVars into CSS
//  - theme colours/spacing/radius/duration/font map token name -> CSS var
//
// Paths:
//   - input  (--tokens / env FLUENT_TOKENS / default ../../data/tokens/fluent-tokens.json)
//   - output (--out  / default <script dir>/preset-fluent.ts)
// Defaults are resolved relative to THIS script's location (portable). Override
// with --tokens / --out (or env vars) when the token file lives elsewhere.
//
// Usage: node gen-preset.js [--tokens <path>] [--out <path>]
const fs = require('fs');
const path = require('path');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const tokensPath = arg('--tokens', process.env.FLUENT_TOKENS)
  || path.join(__dirname, '..', '..', 'data', 'tokens', 'fluent-tokens.json');
const outPath = arg('--out') || path.join(__dirname, 'preset-fluent.ts');

if (!fs.existsSync(tokensPath)) {
  console.error(
    '[fluent gen-preset] Cannot find Fluent token data at: ' + path.resolve(tokensPath) + '\n' +
    'Provide the real input path with: node gen-preset.js --tokens <path/to/fluent-tokens.json>\n' +
    'The file is produced by installing @fluentui/tokens and running the project\'s token extraction.\n' +
    'See the fluent-adapter-css skill "生成/更新文件" section. Ask a human if the path is unspecified.'
  );
  process.exit(1);
}

const d = require(path.resolve(tokensPath));

const globals = {};
Object.assign(globals, d.spacing.horizontal, d.spacing.vertical);
Object.assign(globals, d.radius, d.strokeWidths, d.durations, d.curves);
Object.assign(globals, d.typography.fontSizes, d.typography.lineHeights, d.typography.fontWeights, d.typography.fontFamilies);

// Build a valid-TS object literal: { '--Key': 'value', ... } (comma-separated, quoted)
function objBlock(map) {
  const entries = Object.entries(map)
    .map(([k, v]) => `      '--${k}': ${JSON.stringify(v)},`)
    .sort((a, b) => a.localeCompare(b));
  return entries.join('\n');
}

const globalsBlock = objBlock(globals);
const lightBlock = objBlock(d.alias.lightWeb);
const darkBlock = objBlock(d.alias.darkWeb);

const themeColorsLight = Object.entries(d.alias.lightWeb)
  .map(([k]) => `      '${k}': 'var(--${k})',`).sort().join('\n');
const themeColorsDark = Object.entries(d.alias.darkWeb)
  .map(([k]) => `      '${k}': 'var(--${k})',`).sort().join('\n');

const spMap = [
  ['none','None'],['xxs','XXS'],['xs','XS'],['s','S'],['m','M'],['l','L'],['xl','XL'],['xxl','XXL'],['xxxl','XXXL']
].map(([key, tok]) => `        'fluent-${key}': 'var(--spacingHorizontal${tok})',`).join('\n');

const ts = `// Generated from @fluentui/tokens (source of truth: data/tokens/fluent-tokens.json).
// UnoCSS preset for Fluent 2 — TypeScript-first.
//
// uno.config.ts:
//   import { defineConfig, presetWind3 } from 'unocss'
//   import { presetFluent } from './preset-fluent'
//   export default defineConfig({ presets: [presetWind3(), presetFluent()] })
//
// app entry: import 'virtual:uno.css'
// Utilities: bg-colorBrandBackground, text-colorNeutralForeground1,
//            p-fluent-m, rounded-fluent-md, duration-fluent-fast, ...
import type { Preset } from 'unocss'

/** CSS custom properties injected as a preflight: selector -> { '--Token': value }. */
const cssVars: Record<string, Record<string, string>> = {
  ':root': {
${globalsBlock}
  },
  ':root[data-theme="light"], .fluent-light': {
${lightBlock}
  },
  ':root[data-theme="dark"], .fluent-dark': {
${darkBlock}
  },
}

const cssText = Object.entries(cssVars)
  .map(([selector, decls]) =>
    selector + ' {\\n' +
    Object.entries(decls).map(([prop, value]) => '  ' + prop + ': ' + value + ';').join('\\n') +
    '\\n}',
  )
  .join('\\n')

export interface FluentPresetOptions {
  /** Inject base CSS variables as a preflight. Default true. */
  preflight?: boolean
}

/** Fluent 2 UnoCSS preset. Theme keys = exact token names referencing var(--TokenName). */
export function presetFluent(options: FluentPresetOptions = {}): Preset {
  const { preflight = true } = options
  return {
    name: 'fluent2',
    preflights: preflight ? [{ getCSS: () => cssText }] : [],
    theme: {
      colors: {
${themeColorsLight}
      },
      darkColors: {
${themeColorsDark}
      },
      spacing: {
${spMap}
      },
      borderRadius: {
        'fluent-none': 'var(--borderRadiusNone)',
        'fluent-sm': 'var(--borderRadiusSmall)',
        'fluent-md': 'var(--borderRadiusMedium)',
        'fluent-lg': 'var(--borderRadiusLarge)',
        'fluent-xl': 'var(--borderRadiusXLarge)',
        'fluent-2xl': 'var(--borderRadius2XLarge)',
        'fluent-3xl': 'var(--borderRadius3XLarge)',
        'fluent-4xl': 'var(--borderRadius4XLarge)',
        'fluent-5xl': 'var(--borderRadius5XLarge)',
        'fluent-6xl': 'var(--borderRadius6XLarge)',
        'fluent-circular': 'var(--borderRadiusCircular)',
      },
      duration: {
        'fluent-ultra-fast': 'var(--durationUltraFast)',
        'fluent-faster': 'var(--durationFaster)',
        'fluent-fast': 'var(--durationFast)',
        'fluent-normal': 'var(--durationNormal)',
        'fluent-gentle': 'var(--durationGentle)',
        'fluent-slow': 'var(--durationSlow)',
        'fluent-slower': 'var(--durationSlower)',
        'fluent-ultra-slow': 'var(--durationUltraSlow)',
      },
    },
  }
}

export default presetFluent
`;
fs.writeFileSync(path.resolve(outPath), ts);
console.log('wrote', path.resolve(outPath), 'lines =', ts.split('\n').length);