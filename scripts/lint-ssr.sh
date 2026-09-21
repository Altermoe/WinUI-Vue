#!/usr/bin/env bash
# 顾问式 SSR 安全检查（需人工复核，不阻断 CI）。
#
# 背景：组件库代码在服务端渲染时也会执行 setup()，若在 setup 顶层裸写浏览器
# 专属 API（window/document/navigator/matchMedia/ResizeObserver…）会直接抛错
# 导致整页 500。自动化防线以 renderToString 冒烟测试为准
# （packages/ui/src/__tests__/ssr-smoke.test.ts，精确且无假阳性）；
# 本脚本只是把「疑似泄漏点」列出来供 review。
#
# 排除说明：
#   - packages/hooks、packages/utils：能力探测与 SSR 安全 composable 的指定住所，
#     其中的 globalThis.matchMedia 等是受控的合法访问；
#   - 测试目录：jsdom 环境行为不同，且常显式 stub 浏览器 API。
#
# 已知良性告警：packages/ui/src/scrollview/use-measurement.ts 在 onMounted 内
# new ResizeObserver(...) 是正确写法，会被本脚本列出，属预期。
set -uo pipefail
cd "$(dirname "$0")/.."

matches="$(
  grep -rnE \
    -e "globalThis\.matchMedia\(" \
    -e "new (ResizeObserver|MutationObserver|IntersectionObserver)\(" \
    -e "(^|[^a-zA-Z_.])(window|document|navigator)\.[A-Za-z]" \
    packages/*/src --include="*.ts" --include="*.vue" 2>/dev/null \
    | grep -v "/__tests__/" \
    | grep -v "packages/hooks/" \
    | grep -v "packages/utils/" \
    || true
)"

if [ -n "$matches" ]; then
  echo "⚠️  疑似 SSR 不安全的浏览器 API 访问（请人工复核是否位于 setup/模块顶层）："
  echo "$matches"
else
  echo "✅ 未发现疑似泄漏"
fi
exit 0
