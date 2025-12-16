import UPNG from 'upng-js';
import * as fontkit from 'fontkit';
import type { AnimationType, LookType } from '../stores/animation-store';
import { getTheme, type ThemeName, type ThemeColors } from './themes';

// Fontkit 字型類型
type FontkitFont = fontkit.Font;

// Virgil 字型快取（使用 fontkit）
let virgilFont: FontkitFont | null = null;

/**
 * 使用 fontkit 載入 Virgil 字型
 * fontkit 支援 woff2 格式，可以將文字轉換為 SVG 路徑
 */
async function loadVirgilFontFontkit(): Promise<FontkitFont | null> {
  if (virgilFont) return virgilFont;

  try {
    const response = await fetch('https://excalidraw.nyc3.cdn.digitaloceanspaces.com/fonts/Virgil.woff2');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const fontOrCollection = fontkit.create(buffer as Buffer);

    // fontkit.create 可能回傳 Font 或 FontCollection
    // 如果是 FontCollection，取第一個字型
    if ('fonts' in fontOrCollection) {
      virgilFont = fontOrCollection.fonts[0];
    } else {
      virgilFont = fontOrCollection;
    }

    return virgilFont;
  } catch (error) {
    console.error('Failed to load Virgil font with fontkit:', error);
    return null;
  }
}

/**
 * 使用 fontkit 將文字轉換為 SVG path data
 * fontkit 的 layout() 會回傳每個 glyph 的路徑和位置
 */
function textToPathData(font: FontkitFont, text: string, x: number, y: number, fontSize: number): string {
  const run = font.layout(text);
  const scale = fontSize / font.unitsPerEm;

  let currentX = x;
  const pathParts: string[] = [];

  for (let i = 0; i < run.glyphs.length; i++) {
    const glyph = run.glyphs[i];
    const position = run.positions[i];

    // 取得 glyph 的 SVG 路徑
    const glyphPath = glyph.path.toSVG();

    if (glyphPath) {
      // 轉換路徑到正確位置（考慮縮放和位置偏移）
      // SVG 路徑需要轉換座標
      const transformedPath = transformSvgPath(
        glyphPath,
        currentX + position.xOffset * scale,
        y + position.yOffset * scale,
        scale
      );
      pathParts.push(transformedPath);
    }

    currentX += position.xAdvance * scale;
  }

  return pathParts.join(' ');
}

/**
 * 轉換 SVG 路徑到指定位置和縮放
 */
function transformSvgPath(pathData: string, tx: number, ty: number, scale: number): string {
  // SVG 路徑命令：M, L, H, V, C, S, Q, T, A, Z
  // 需要轉換所有座標
  return pathData.replace(
    /([MLHVCSQTA])([^MLHVCSQTAZ]*)/gi,
    (_match, cmd, args) => {
      const upperCmd = cmd.toUpperCase();
      const isRelative = cmd !== upperCmd;

      if (upperCmd === 'Z') return cmd;

      const numbers = args.trim().split(/[\s,]+/).map(Number);
      const transformed: number[] = [];

      switch (upperCmd) {
        case 'M':
        case 'L':
        case 'T':
          // x, y 座標對
          for (let i = 0; i < numbers.length; i += 2) {
            if (isRelative) {
              transformed.push(numbers[i] * scale, numbers[i + 1] * -scale);
            } else {
              transformed.push(numbers[i] * scale + tx, numbers[i + 1] * -scale + ty);
            }
          }
          break;
        case 'H':
          // 水平線 x
          for (const n of numbers) {
            transformed.push(isRelative ? n * scale : n * scale + tx);
          }
          break;
        case 'V':
          // 垂直線 y
          for (const n of numbers) {
            transformed.push(isRelative ? n * -scale : n * -scale + ty);
          }
          break;
        case 'C':
          // 三次貝茲曲線：x1, y1, x2, y2, x, y
          for (let i = 0; i < numbers.length; i += 6) {
            if (isRelative) {
              transformed.push(
                numbers[i] * scale, numbers[i + 1] * -scale,
                numbers[i + 2] * scale, numbers[i + 3] * -scale,
                numbers[i + 4] * scale, numbers[i + 5] * -scale
              );
            } else {
              transformed.push(
                numbers[i] * scale + tx, numbers[i + 1] * -scale + ty,
                numbers[i + 2] * scale + tx, numbers[i + 3] * -scale + ty,
                numbers[i + 4] * scale + tx, numbers[i + 5] * -scale + ty
              );
            }
          }
          break;
        case 'S':
        case 'Q':
          // S: x2, y2, x, y / Q: x1, y1, x, y
          for (let i = 0; i < numbers.length; i += 4) {
            if (isRelative) {
              transformed.push(
                numbers[i] * scale, numbers[i + 1] * -scale,
                numbers[i + 2] * scale, numbers[i + 3] * -scale
              );
            } else {
              transformed.push(
                numbers[i] * scale + tx, numbers[i + 1] * -scale + ty,
                numbers[i + 2] * scale + tx, numbers[i + 3] * -scale + ty
              );
            }
          }
          break;
        case 'A':
          // 弧線：rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y
          for (let i = 0; i < numbers.length; i += 7) {
            transformed.push(
              numbers[i] * scale,
              numbers[i + 1] * scale,
              numbers[i + 2],
              numbers[i + 3],
              numbers[i + 4]
            );
            if (isRelative) {
              transformed.push(numbers[i + 5] * scale, numbers[i + 6] * -scale);
            } else {
              transformed.push(numbers[i + 5] * scale + tx, numbers[i + 6] * -scale + ty);
            }
          }
          break;
      }

      return cmd + transformed.join(' ');
    }
  );
}

/**
 * 計算文字在指定字型和大小下的寬度
 */
function measureTextWidth(font: FontkitFont, text: string, fontSize: number): number {
  const run = font.layout(text);
  const scale = fontSize / font.unitsPerEm;

  let width = 0;
  for (const position of run.positions) {
    width += position.xAdvance * scale;
  }
  return width;
}

interface ExportOptions {
  fps?: number;
  duration?: number; // 總動畫時長（秒）
  scale?: number;
  backgroundColor?: string;
  animationType?: AnimationType; // 動畫類型：dash, particle, both
  theme?: ThemeName; // 主題配色
  look?: LookType; // 風格：classic, handDrawn
  transparent?: boolean; // 透明背景
}

/**
 * 從 viewBox 字串解析尺寸
 *
 * 【重要】這個函數用於計算 APNG 匯出的尺寸
 * 回傳的尺寸必須直接用於 Canvas 和 SVG，不可縮放
 */
export interface ViewBoxDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 解析 SVG viewBox 字串
 * @param viewBox - viewBox 字串，格式為 "x y width height"
 * @returns 解析後的尺寸物件，如果解析失敗則回傳 null
 */
export function parseViewBox(viewBox: string | null): ViewBoxDimensions | null {
  if (!viewBox) return null;

  const parts = viewBox.split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return null;
  }

  return {
    x: parts[0],
    y: parts[1],
    width: parts[2],
    height: parts[3],
  };
}

/**
 * 計算匯出尺寸
 *
 * @param viewBox - 解析後的 viewBox 尺寸
 * @param scale - 縮放倍率（1, 2, 3）
 * @returns Canvas 應該使用的寬高（已乘以 scale）
 */
export function calculateExportDimensions(viewBox: ViewBoxDimensions, scale: number = 1): {
  width: number;
  height: number;
} {
  return {
    width: Math.round(viewBox.width * scale),
    height: Math.round(viewBox.height * scale),
  };
}

/**
 * 驗證匯出尺寸是否正確設定
 * 用於確保 SVG width/height 與 viewBox 一致
 */
export function validateExportSetup(
  svgWidth: number,
  svgHeight: number,
  viewBox: ViewBoxDimensions
): { valid: boolean; error?: string } {
  const expectedWidth = Math.round(viewBox.width);
  const expectedHeight = Math.round(viewBox.height);

  if (svgWidth !== expectedWidth || svgHeight !== expectedHeight) {
    return {
      valid: false,
      error: `SVG 尺寸 (${svgWidth}x${svgHeight}) 與 viewBox 尺寸 (${expectedWidth}x${expectedHeight}) 不一致，會導致圖片變形`,
    };
  }

  return { valid: true };
}

/**
 * 將 SVG 元素匯出為 APNG 動畫圖片
 *
 * 縮放原理：
 * - viewBox 保持原始尺寸（內容座標系）
 * - SVG 的 width/height 設為縮放後的尺寸
 * - Canvas 尺寸與 SVG width/height 一致
 * - 瀏覽器會自動將 viewBox 內容縮放到 width/height 尺寸
 */
export async function exportToAPNG(
  svgElement: SVGSVGElement,
  options: ExportOptions = {}
): Promise<Blob> {
  const { fps = 24, duration = 2, animationType = 'both', theme = 'dark-cyan', look = 'classic', transparent = false, scale = 1 } = options;
  const fontFamily = look === 'handDrawn' ? 'Virgil, cursive' : 'Arial, sans-serif';

  // 如果是手繪風格，使用 fontkit 載入 Virgil 字型
  // 這樣可以將文字轉換為 SVG 路徑，避免 canvas 字型載入問題
  let fontkitFont: FontkitFont | null = null;
  if (look === 'handDrawn') {
    fontkitFont = await loadVirgilFontFontkit();
  }

  // 使用主題配色決定背景色（透明模式則不使用背景）
  const themeColors = getTheme(theme);
  const backgroundColor = transparent ? null : (options.backgroundColor || themeColors.background);
  const totalFrames = Math.round(fps * duration);
  const frameDelay = 1000 / fps; // 毫秒

  // 【重要】從原始 SVG 的 viewBox 取得尺寸
  // 這個尺寸決定了最終輸出圖片的大小，不要修改或縮放
  const originalViewBox = svgElement.getAttribute('viewBox');
  const parsedViewBox = parseViewBox(originalViewBox);

  let contentX: number;
  let contentY: number;
  let contentWidth: number;
  let contentHeight: number;

  if (parsedViewBox) {
    contentX = parsedViewBox.x;
    contentY = parsedViewBox.y;
    contentWidth = parsedViewBox.width;
    contentHeight = parsedViewBox.height;
  } else {
    // fallback 到 getBBox（當 SVG 沒有 viewBox 時）
    const bbox = svgElement.getBBox();
    const padding = 20;
    contentX = bbox.x - padding;
    contentY = bbox.y - padding;
    contentWidth = bbox.width + padding * 2;
    contentHeight = bbox.height + padding * 2;
  }

  // 使用 calculateExportDimensions 計算尺寸（含縮放）
  const { width, height } = calculateExportDimensions({
    x: contentX,
    y: contentY,
    width: contentWidth,
    height: contentHeight,
  }, scale);

  // 建立 canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 收集所有幀的像素資料
  const frames: ArrayBuffer[] = [];
  const delays: number[] = [];

  // 取得原始 SVG 中的路徑資訊（用於計算粒子位置）
  const pathsInfo = extractPathsInfo(svgElement);

  for (let frame = 0; frame < totalFrames; frame++) {
    const progress = frame / totalFrames;

    // 為每一幀建立新的 SVG 克隆
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

    // 準備 SVG 以便匯出（使用原始尺寸，縮放由 canvas 處理）
    prepareSvgForExport(clonedSvg, contentWidth, contentHeight, backgroundColor, contentX, contentY, contentWidth, contentHeight, themeColors, fontFamily, fontkitFont);

    // 更新動畫狀態
    updateAnimationFrame(clonedSvg, progress, duration, pathsInfo, animationType, themeColors);

    // 將 SVG 轉換為圖片（傳入 scale 讓 canvas 做縮放）
    const imageData = await svgToImageData(clonedSvg, width, height, ctx, scale);
    frames.push(imageData.buffer as ArrayBuffer);
    delays.push(frameDelay);
  }

  // 使用 UPNG 編碼為 APNG
  const apngData = UPNG.encode(
    frames,
    width,
    height,
    0, // 無損壓縮
    delays
  );

  return new Blob([apngData], { type: 'image/png' });
}

interface PathInfo {
  pathData: string;
  totalLength: number;
}

/**
 * 從原始 SVG 提取路徑資訊
 */
function extractPathsInfo(svg: SVGSVGElement): PathInfo[] {
  const paths: PathInfo[] = [];
  const pathElements = svg.querySelectorAll('.flow-particle');

  pathElements.forEach((particle) => {
    const animateMotion = particle.querySelector('animateMotion');
    if (animateMotion) {
      const mpath = animateMotion.querySelector('mpath');
      if (mpath) {
        const pathId = mpath.getAttribute('href')?.replace('#', '');
        if (pathId) {
          const pathEl = svg.querySelector(`#${pathId}`) as SVGPathElement;
          if (pathEl) {
            paths.push({
              pathData: pathEl.getAttribute('d') || '',
              totalLength: pathEl.getTotalLength(),
            });
          }
        }
      }
    }
  });

  return paths;
}

/**
 * 準備 SVG 以便匯出
 *
 * SVG 的 viewBox 和 width/height 都設為原始尺寸。
 * 縮放由 canvas 的 ctx.scale() 處理，避免圖片變形。
 */
function prepareSvgForExport(
  svg: SVGSVGElement,
  width: number,
  height: number,
  backgroundColor: string | null,
  viewBoxX: number,
  viewBoxY: number,
  viewBoxWidth: number,
  viewBoxHeight: number,
  themeColors: ThemeColors,
  fontFamily: string,
  fontkitFont: FontkitFont | null
): void {
  // viewBox 保持原始尺寸，width/height 設為縮放後的尺寸
  svg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  // 移除 preserveAspectRatio 避免任何額外的縮放行為
  svg.removeAttribute('preserveAspectRatio');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // 只在非透明模式下添加背景矩形
  if (backgroundColor) {
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    // 使用 viewBox 座標系的絕對值，確保背景覆蓋整個區域
    bgRect.setAttribute('x', String(viewBoxX));
    bgRect.setAttribute('y', String(viewBoxY));
    bgRect.setAttribute('width', String(viewBoxWidth));
    bgRect.setAttribute('height', String(viewBoxHeight));
    bgRect.setAttribute('fill', backgroundColor);
    svg.insertBefore(bgRect, svg.firstChild);
  }

  // 處理 foreignObject 中的文字 - 轉換為 SVG text 或 path（使用主題的文字顏色和指定字型）
  // 如果有 fontkit 字型，則將文字轉為 SVG 路徑，避免 canvas 字型載入問題
  convertForeignObjectsToText(svg, themeColors, fontFamily, fontkitFont);

  // 移除 SMIL 動畫元素（我們手動控制位置）
  const animateElements = svg.querySelectorAll('animateMotion, animate, animateTransform');
  animateElements.forEach((el) => el.remove());

  // 內嵌樣式（使用主題配色和指定字型）
  inlineAllStyles(svg, themeColors, fontFamily);
}

/**
 * 將 foreignObject 中的文字轉換為 SVG text 或 path 元素
 * 如果提供了 fontkit 字型，則轉換為 path 元素（避免 canvas 字型載入問題）
 */
function convertForeignObjectsToText(
  svg: SVGSVGElement,
  themeColors: ThemeColors,
  fontFamily: string,
  fontkitFont: FontkitFont | null
): void {
  const foreignObjects = svg.querySelectorAll('foreignObject');
  const fontSize = 14;

  foreignObjects.forEach((fo) => {
    const x = parseFloat(fo.getAttribute('x') || '0');
    const y = parseFloat(fo.getAttribute('y') || '0');
    const foWidth = parseFloat(fo.getAttribute('width') || '0');
    const foHeight = parseFloat(fo.getAttribute('height') || '0');

    // 取得文字內容
    const textContent = fo.textContent?.trim() || '';

    if (textContent) {
      if (fontkitFont) {
        // 使用 fontkit 將文字轉換為 SVG path
        // 計算文字寬度以置中
        const textWidth = measureTextWidth(fontkitFont, textContent, fontSize);
        // 計算置中位置
        const textX = x + (foWidth - textWidth) / 2;
        // y 位置：foreignObject 中心 + 字型基線調整
        const textY = y + foHeight / 2 + fontSize * 0.35;

        // 取得路徑資料
        const pathData = textToPathData(fontkitFont, textContent, textX, textY, fontSize);

        // 建立 path 元素
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', pathData);
        pathEl.setAttribute('fill', themeColors.textColor);
        pathEl.setAttribute('stroke', 'none');

        // 插入到 foreignObject 的位置
        fo.parentNode?.insertBefore(pathEl, fo);
      } else {
        // 沒有 opentype 字型時，使用傳統 text 元素
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', String(x + foWidth / 2));
        textEl.setAttribute('y', String(y + foHeight / 2 + 5)); // +5 調整垂直置中
        textEl.setAttribute('text-anchor', 'middle');
        textEl.setAttribute('dominant-baseline', 'middle');
        textEl.setAttribute('fill', themeColors.textColor);
        textEl.setAttribute('font-family', fontFamily);
        textEl.setAttribute('font-size', String(fontSize));
        textEl.textContent = textContent;

        // 插入到 foreignObject 的位置
        fo.parentNode?.insertBefore(textEl, fo);
      }
    }

    // 移除 foreignObject
    fo.remove();
  });
}

/**
 * 內嵌所有樣式（使用主題配色和指定字型）
 */
function inlineAllStyles(svg: SVGSVGElement, themeColors: ThemeColors, fontFamily: string): void {
  // 先處理特定元素的樣式

  // 處理節點 (rect, polygon, circle 等)
  const nodes = svg.querySelectorAll('.node rect, .node polygon, .node circle, .nodes rect');
  nodes.forEach((el) => {
    const computed = window.getComputedStyle(el);
    // 保留原有的 fill，如果沒有則使用主題節點背景色
    if (!el.getAttribute('fill') || el.getAttribute('fill') === 'none') {
      el.setAttribute('fill', computed.fill || themeColors.nodeBackground);
    }
    // 設定邊框（使用主題顏色）
    el.setAttribute('stroke', themeColors.nodeBorder);
    el.setAttribute('stroke-width', '2');
  });

  // 處理連接線 (edge paths)
  const edgePaths = svg.querySelectorAll('.edgePath path, path.flowchart-link, path[marker-end]');
  edgePaths.forEach((el) => {
    el.setAttribute('stroke', themeColors.lineColor);
    el.setAttribute('stroke-width', '2');
    el.setAttribute('fill', 'none');
  });

  // 處理箭頭 marker
  const markers = svg.querySelectorAll('marker path, marker polygon');
  markers.forEach((el) => {
    el.setAttribute('fill', themeColors.lineColor);
    el.setAttribute('stroke', themeColors.lineColor);
  });

  // 處理 edge labels
  const edgeLabels = svg.querySelectorAll('.edgeLabel rect, .edgeLabel span, .edgeLabel');
  edgeLabels.forEach((el) => {
    if (el.tagName === 'rect') {
      el.setAttribute('fill', themeColors.edgeLabelBackground);
    }
  });

  // 處理文字
  const texts = svg.querySelectorAll('text, tspan');
  texts.forEach((el) => {
    if (!el.getAttribute('fill')) {
      el.setAttribute('fill', themeColors.textColor);
    }
    el.setAttribute('font-family', fontFamily);
  });

  // 處理粒子
  const particles = svg.querySelectorAll('.flow-particle');
  particles.forEach((el) => {
    el.setAttribute('fill', themeColors.particleColor);
  });

  // 移除所有 style 元素（避免外部依賴）
  svg.querySelectorAll('style').forEach((s) => s.remove());
}

/**
 * 更新動畫幀
 * 根據 animationType 決定要渲染哪種動畫效果（使用主題配色）
 */
function updateAnimationFrame(
  svg: SVGSVGElement,
  progress: number,
  duration: number,
  pathsInfo: PathInfo[],
  animationType: AnimationType,
  themeColors: ThemeColors
): void {
  const showDash = animationType === 'dash' || animationType === 'both';
  const showParticle = animationType === 'particle' || animationType === 'both';

  // 更新虛線動畫 (dash-flow) - 只在 dash 或 both 模式
  const edgePaths = svg.querySelectorAll('[class*="dash-flow"], path[marker-end]');
  edgePaths.forEach((el) => {
    if (showDash) {
      // 設定虛線樣式和動畫
      el.setAttribute('stroke-dasharray', '10 5');
      const offset = 15 - ((progress * 15 * duration * 2) % 15);
      el.setAttribute('stroke-dashoffset', String(offset));
    } else {
      // particle 模式：實線，不要虛線
      el.removeAttribute('stroke-dasharray');
      el.removeAttribute('stroke-dashoffset');
    }
  });

  // 更新粒子位置 - 只在 particle 或 both 模式
  const particles = svg.querySelectorAll('.flow-particle');
  particles.forEach((particle, index) => {
    if (showParticle && pathsInfo[index]) {
      // 使用臨時 path 來計算位置
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempPath.setAttribute('d', pathsInfo[index].pathData);
      document.body.appendChild(tempPath);

      try {
        const pathLength = tempPath.getTotalLength();
        const point = tempPath.getPointAtLength(pathLength * progress);
        (particle as SVGCircleElement).setAttribute('cx', String(point.x));
        (particle as SVGCircleElement).setAttribute('cy', String(point.y));

        // 確保粒子樣式和可見性（使用主題的粒子顏色）
        particle.setAttribute('fill', themeColors.particleColor);
        particle.setAttribute('r', '4');
        particle.setAttribute('opacity', '1');
      } finally {
        document.body.removeChild(tempPath);
      }
    } else {
      // dash 模式：隱藏粒子
      particle.setAttribute('opacity', '0');
    }
  });
}

/**
 * 將 SVG 轉換為 ImageData（使用 data URL 避免跨域問題）
 *
 * 使用 ctx.scale() 縮放座標系來實現高解析度輸出，
 * 避免使用 drawImage 的目標尺寸參數導致變形。
 */
async function svgToImageData(
  svg: SVGSVGElement,
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    const svgData = new XMLSerializer().serializeToString(svg);

    // 使用 data URL 而不是 blob URL 來避免跨域問題
    const base64 = btoa(unescape(encodeURIComponent(svgData)));
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    const img = new Image();

    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      // 使用 scale 縮放座標系，然後以原始尺寸繪製
      ctx.save();
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      const imageData = ctx.getImageData(0, 0, width, height);
      resolve(imageData.data);
    };

    img.onerror = () => {
      reject(new Error('Failed to load SVG image'));
    };

    img.src = dataUrl;
  });
}

/**
 * 下載 Blob 為檔案
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
