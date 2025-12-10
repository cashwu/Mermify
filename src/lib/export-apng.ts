import UPNG from 'upng-js';

interface ExportOptions {
  fps?: number;
  duration?: number; // 總動畫時長（秒）
  scale?: number;
  backgroundColor?: string;
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
 * 【重要】回傳的尺寸必須直接使用，不可縮放
 * 瀏覽器載入 SVG 為 Image 時會使用 viewBox 尺寸作為 naturalWidth/naturalHeight
 * 如果 Canvas 尺寸與 viewBox 不一致，會導致圖片變形或空白
 *
 * @param viewBox - 解析後的 viewBox 尺寸
 * @returns Canvas 應該使用的寬高
 */
export function calculateExportDimensions(viewBox: ViewBoxDimensions): {
  width: number;
  height: number;
} {
  // 【重要】直接使用 viewBox 尺寸，四捨五入為整數
  // 不要乘以任何 scale 係數
  return {
    width: Math.round(viewBox.width),
    height: Math.round(viewBox.height),
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
 * 【重要】關於尺寸處理的說明：
 * 瀏覽器將 SVG 載入為 Image 時，會使用 viewBox 的尺寸作為 naturalWidth/naturalHeight，
 * 而不是 SVG 元素上設定的 width/height 屬性。
 *
 * 因此，為了避免圖片變形或出現空白：
 * 1. Canvas 尺寸必須與 viewBox 尺寸一致
 * 2. SVG 的 width/height 屬性必須與 viewBox 尺寸一致
 * 3. 不要嘗試在這裡做縮放（scale），會導致圖片變形
 * 4. 繪製時直接使用 ctx.drawImage(img, 0, 0)，不指定目標尺寸
 *
 * 如果需要更高解析度的輸出，應該在 Mermaid 渲染時就設定較大的尺寸，
 * 而不是在匯出時縮放。
 */
export async function exportToAPNG(
  svgElement: SVGSVGElement,
  options: ExportOptions = {}
): Promise<Blob> {
  const { fps = 24, duration = 2, backgroundColor = '#0f172a' } = options;
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

  // 【重要】使用 calculateExportDimensions 計算尺寸
  // 此函數確保不會進行任何縮放
  const { width, height } = calculateExportDimensions({
    x: contentX,
    y: contentY,
    width: contentWidth,
    height: contentHeight,
  });

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

    // 準備 SVG 以便匯出（不傳 scale，因為我們用原始尺寸）
    prepareSvgForExport(clonedSvg, width, height, backgroundColor, contentX, contentY, contentWidth, contentHeight);

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
 *
 * 【重要】SVG 的 width/height 必須與 viewBox 尺寸一致
 * 不要嘗試設定不同的 width/height 來縮放，這會導致圖片變形
 */
function prepareSvgForExport(
  svg: SVGSVGElement,
  _width: number,
  _height: number,
  backgroundColor: string,
  viewBoxX: number,
  viewBoxY: number,
  viewBoxWidth: number,
  viewBoxHeight: number
): void {
  // 【重要】viewBox 和 width/height 必須一致，否則會變形
  svg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
  svg.setAttribute('width', String(viewBoxWidth));
  svg.setAttribute('height', String(viewBoxHeight));
  // 移除 preserveAspectRatio 避免任何額外的縮放行為
  svg.removeAttribute('preserveAspectRatio');
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
 *
 * 【重要】繪製時不要指定目標尺寸
 * 使用 ctx.drawImage(img, 0, 0) 而不是 ctx.drawImage(img, 0, 0, width, height)
 * 因為後者會強制縮放圖片，導致變形
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
      // 【重要】直接繪製，不指定目標尺寸，避免變形
      ctx.drawImage(img, 0, 0);

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
