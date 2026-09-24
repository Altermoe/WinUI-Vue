// Generate fluent.css (CSS custom properties) from Fluent tokens.
//
// Paths:
//   - input  (--tokens / env FLUENT_TOKENS / default ../../data/tokens/fluent-tokens.json)
//   - output (--out  / default <script dir>/fluent.css)
// Defaults are resolved relative to THIS script's location, so the script is
// portable across checkouts. Override with --tokens / --out (or the env vars)
// when the token file lives somewhere else — e.g. produced by `npm i @fluentui/tokens`.
//
// Usage:
//   node gen-css.js
//   node gen-css.js --tokens /abs/or/relative/path/to/fluent-tokens.json --out ./fluent.css
const fs = require('fs');
const path = require('path');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const tokensPath = arg('--tokens', process.env.FLUENT_TOKENS)
  || path.join(__dirname, '..', '..', 'data', 'tokens', 'fluent-tokens.json');
const outPath = arg('--out')
  || path.join(__dirname, 'fluent.css');

if (!fs.existsSync(tokensPath)) {
  console.error(
    '[fluent gen-css] Cannot find Fluent token data at: ' + path.resolve(tokensPath) + '\n' +
    'Provide the real input path with: node gen-css.js --tokens <path/to/fluent-tokens.json>\n' +
    'The file is produced by installing @fluentui/tokens and running the project\'s token extraction.\n' +
    'See the fluent-adapter-css skill "生成/更新文件" section. Ask a human if the path is unspecified.'
  );
  process.exit(1);
}

const d = require(path.resolve(tokensPath));

// Elevation (shadow2..64 / shadow2Brand..64Brand) lives in the GLOBAL block: the values are
// multi-value token streams ("0 0 2px var(--colorNeutralShadowAmbient), 0 8px 16px ...") whose
// colour parts reference the semantic shadow-colour variables that the `[data-theme]` blocks
// swap. They are theme-independent compositions, so a single :root definition is enough.
//
// Never wrap a multi-value token in light-dark(): the function takes exactly two <color>
// arguments, so `light-dark(a, b, c, d)` is invalid CSS and the browser drops the WHOLE
// declaration (that is how --shadow2..64 silently disappeared in an earlier iteration).
if (!d.shadows) {
  console.warn(
    '[fluent gen-css] token data has no "shadows" section: elevation tokens (shadow2..64) ' +
    'will be missing from fluent.css. See the fluent-tokens skill "重建" notes.'
  );
}

const globals = {};
Object.assign(globals, d.spacing.horizontal, d.spacing.vertical);
Object.assign(globals, d.radius, d.strokeWidths, d.durations, d.curves, d.shadows);
Object.assign(globals, d.typography.fontSizes, d.typography.lineHeights, d.typography.fontWeights, d.typography.fontFamilies);

function emit(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `  --${k}: ${v};`)
    .sort((a, b) => a.localeCompare(b))
    .join('\n');
}

const css = `/* Generated from @fluentui/tokens (source of truth: data/tokens/fluent-tokens.json; actual path may be overridden via --tokens).
   Token names match @fluentui/tokens exactly. Consume as var(--TokenName). */
:root {
${emit(globals)}
}
:root[data-theme="light"], .fluent-light {
${emit(d.alias.lightWeb)}
}
:root[data-theme="dark"], .fluent-dark {
${emit(d.alias.darkWeb)}
}
`;
fs.writeFileSync(path.resolve(outPath), css);
console.log('wrote', path.resolve(outPath), 'lines =', css.split('\n').length,
  'globals =', Object.keys(globals).length,
  'light =', Object.keys(d.alias.lightWeb).length,
  'dark =', Object.keys(d.alias.darkWeb).length);