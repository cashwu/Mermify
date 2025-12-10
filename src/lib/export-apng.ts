import UPNG from 'upng-js';

interface ExportOptions {
  fps?: number;
  duration?: number; // 總動畫時長（秒）
  scale?: number;
  backgroundColor?: string;
}

/**
 * 將 SVG 元素匯出為 APNG 動畫圖片
 */
export async function exportToAPNG(
  svgElement: SVGSVGElement,
  options: ExportOptions = {}
): Promise<Blob> {
  const { fps = 24, duration = 2, scale = 2, backgroundColor = '#0f172a' } = options;
  const totalFrames = Math.round(fps * duration);
  const frameDelay = 1000 / fps; // 毫秒

  // 取得 SVG 實際顯示尺寸
  const rect = svgElement.getBoundingClientRect();
  const width = Math.round(rect.width * scale);
  const height = Math.round(rect.height * scale);

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

    // 準備 SVG 以便匯出
    prepareSvgForExport(clonedSvg, width, height, backgroundColor);

    // 更新動畫狀態
    updateAnimationFrame(clonedSvg, progress, duration, pathsInfo);

    // 將 SVG 轉換為圖片
    const imageData = await svgToImageData(clonedSvg, width, height, ctx);
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
 */
function prepareSvgForExport(
  svg: SVGSVGElement,
  width: number,
  height: number,
  backgroundColor: string
): void {
  // 設定尺寸和 namespace
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // 添加背景矩形
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', backgroundColor);
  svg.insertBefore(bgRect, svg.firstChild);

  // 處理 foreignObject 中的文字 - 轉換為 SVG text
  convertForeignObjectsToText(svg);

  // 移除 SMIL 動畫元素（我們手動控制位置）
  const animateElements = svg.querySelectorAll('animateMotion, animate, animateTransform');
  animateElements.forEach((el) => el.remove());

  // 內嵌樣式
  inlineAllStyles(svg);
}

/**
 * 將 foreignObject 中的文字轉換為 SVG text 元素
 */
function convertForeignObjectsToText(svg: SVGSVGElement): void {
  const foreignObjects = svg.querySelectorAll('foreignObject');

  foreignObjects.forEach((fo) => {
    const x = parseFloat(fo.getAttribute('x') || '0');
    const y = parseFloat(fo.getAttribute('y') || '0');
    const foWidth = parseFloat(fo.getAttribute('width') || '0');
    const foHeight = parseFloat(fo.getAttribute('height') || '0');

    // 取得文字內容
    const textContent = fo.textContent?.trim() || '';

    if (textContent) {
      // 建立 SVG text 元素
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.setAttribute('x', String(x + foWidth / 2));
      textEl.setAttribute('y', String(y + foHeight / 2 + 5)); // +5 調整垂直置中
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('dominant-baseline', 'middle');
      textEl.setAttribute('fill', '#f1f5f9');
      textEl.setAttribute('font-family', 'Arial, sans-serif');
      textEl.setAttribute('font-size', '14');
      textEl.textContent = textContent;

      // 插入到 foreignObject 的位置
      fo.parentNode?.insertBefore(textEl, fo);
    }

    // 移除 foreignObject
    fo.remove();
  });
}

/**
 * 內嵌所有樣式
 */
function inlineAllStyles(svg: SVGSVGElement): void {
  // 先處理特定元素的樣式

  // 處理節點 (rect, polygon, circle 等)
  const nodes = svg.querySelectorAll('.node rect, .node polygon, .node circle, .nodes rect');
  nodes.forEach((el) => {
    const computed = window.getComputedStyle(el);
    // 保留原有的 fill，如果沒有則使用預設
    if (!el.getAttribute('fill') || el.getAttribute('fill') === 'none') {
      el.setAttribute('fill', computed.fill || '#1e293b');
    }
    // 設定邊框
    el.setAttribute('stroke', '#0ea5e9');
    el.setAttribute('stroke-width', '2');
  });

  // 處理連接線 (edge paths)
  const edgePaths = svg.querySelectorAll('.edgePath path, path.flowchart-link, path[marker-end]');
  edgePaths.forEach((el) => {
    el.setAttribute('stroke', '#0ea5e9');
    el.setAttribute('stroke-width', '2');
    el.setAttribute('fill', 'none');
  });

  // 處理箭頭 marker
  const markers = svg.querySelectorAll('marker path, marker polygon');
  markers.forEach((el) => {
    el.setAttribute('fill', '#0ea5e9');
    el.setAttribute('stroke', '#0ea5e9');
  });

  // 處理 edge labels
  const edgeLabels = svg.querySelectorAll('.edgeLabel rect, .edgeLabel span, .edgeLabel');
  edgeLabels.forEach((el) => {
    if (el.tagName === 'rect') {
      el.setAttribute('fill', '#1e293b');
    }
  });

  // 處理文字
  const texts = svg.querySelectorAll('text, tspan');
  texts.forEach((el) => {
    if (!el.getAttribute('fill')) {
      el.setAttribute('fill', '#f1f5f9');
    }
    el.setAttribute('font-family', 'Arial, sans-serif');
  });

  // 處理粒子
  const particles = svg.querySelectorAll('.flow-particle');
  particles.forEach((el) => {
    el.setAttribute('fill', '#0ea5e9');
  });

  // 移除所有 style 元素（避免外部依賴）
  svg.querySelectorAll('style').forEach((s) => s.remove());
}

/**
 * 更新動畫幀
 */
function updateAnimationFrame(
  svg: SVGSVGElement,
  progress: number,
  duration: number,
  pathsInfo: PathInfo[]
): void {
  // 更新虛線動畫 (dash-flow)
  const dashFlowElements = svg.querySelectorAll('[class*="dash-flow"], path[marker-end]');
  dashFlowElements.forEach((el) => {
    // 設定虛線樣式
    el.setAttribute('stroke-dasharray', '10 5');
    const offset = 15 - ((progress * 15 * duration * 2) % 15);
    el.setAttribute('stroke-dashoffset', String(offset));
  });

  // 更新粒子位置
  const particles = svg.querySelectorAll('.flow-particle');
  particles.forEach((particle, index) => {
    if (pathsInfo[index]) {
      // 使用臨時 path 來計算位置
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempPath.setAttribute('d', pathsInfo[index].pathData);
      document.body.appendChild(tempPath);

      try {
        const pathLength = tempPath.getTotalLength();
        const point = tempPath.getPointAtLength(pathLength * progress);
        (particle as SVGCircleElement).setAttribute('cx', String(point.x));
        (particle as SVGCircleElement).setAttribute('cy', String(point.y));

        // 確保粒子樣式
        particle.setAttribute('fill', '#0ea5e9');
        particle.setAttribute('r', '4');
      } finally {
        document.body.removeChild(tempPath);
      }
    }
  });
}

/**
 * 將 SVG 轉換為 ImageData（使用 data URL 避免跨域問題）
 */
async function svgToImageData(
  svg: SVGSVGElement,
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D
): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    const svgData = new XMLSerializer().serializeToString(svg);

    // 使用 data URL 而不是 blob URL 來避免跨域問題
    const base64 = btoa(unescape(encodeURIComponent(svgData)));
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    const img = new Image();

    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

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
