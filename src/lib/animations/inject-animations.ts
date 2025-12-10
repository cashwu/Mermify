import type { AnimationType } from '../../stores/animation-store';

/**
 * 取得所有 edge path 元素 - 支援多種 Mermaid 版本的 SVG 結構
 */
function getEdgePaths(svg: SVGElement): SVGPathElement[] {
  // Mermaid 11.x 可能使用不同的選擇器
  const selectors = [
    '.edgePath path',
    '.flowchart-link',
    '.edge-pattern-solid',
    '.edge-pattern-dotted',
    'path.flowchart-link',
    'g.edgePath > path',
    '.edgePaths path',
    // 更通用的選擇器 - 尋找連接線
    'path[class*="edge"]',
    'path[class*="link"]',
    'path[marker-end]', // 有箭頭的路徑通常是連接線
  ];

  const paths: SVGPathElement[] = [];
  const seen = new Set<Element>();

  for (const selector of selectors) {
    const elements = svg.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el instanceof SVGPathElement && !seen.has(el)) {
        seen.add(el);
        paths.push(el);
      }
    });
  }

  return paths;
}

/**
 * 為 SVG 的 edge path 注入虛線流動動畫
 */
export function injectDashAnimation(svg: SVGElement, speed: number = 1): void {
  const edges = getEdgePaths(svg);

  edges.forEach((el) => {
    el.classList.add('dash-flow');
    el.style.setProperty('--animation-speed', `${1 / speed}s`);
  });
}

/**
 * 為 SVG 的 edge path 注入粒子移動動畫
 */
export function injectParticleAnimation(svg: SVGElement, speed: number = 1): void {
  const edges = getEdgePaths(svg);

  edges.forEach((el, index) => {
    const pathId = `edge-path-${index}-${Date.now()}`;
    el.setAttribute('id', pathId);

    // 創建流動粒子
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#0ea5e9');
    circle.setAttribute('class', 'flow-particle');

    // 創建動畫
    const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
    animateMotion.setAttribute('dur', `${2 / speed}s`);
    animateMotion.setAttribute('repeatCount', 'indefinite');
    animateMotion.setAttribute('calcMode', 'linear');

    // 連結到路徑
    const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
    mpath.setAttribute('href', `#${pathId}`);

    animateMotion.appendChild(mpath);
    circle.appendChild(animateMotion);

    // 添加到 SVG
    const svgRoot = el.closest('svg');
    if (svgRoot) {
      svgRoot.appendChild(circle);
    }
  });
}

/**
 * 清除所有動畫效果
 */
export function clearAnimations(svg: SVGElement): void {
  // 移除虛線動畫 class
  const dashPaths = svg.querySelectorAll('.dash-flow');
  dashPaths.forEach((path) => {
    path.classList.remove('dash-flow');
    (path as HTMLElement).style.removeProperty('--animation-speed');
  });

  // 移除粒子元素
  const particles = svg.querySelectorAll('.flow-particle');
  particles.forEach((particle) => particle.remove());
}

/**
 * 根據動畫類型注入對應的動畫效果
 */
export function injectAnimations(
  svg: SVGElement,
  type: AnimationType,
  speed: number = 1
): void {
  // 先清除現有動畫
  clearAnimations(svg);

  // 根據類型注入動畫
  if (type === 'dash' || type === 'both') {
    injectDashAnimation(svg, speed);
  }

  if (type === 'particle' || type === 'both') {
    injectParticleAnimation(svg, speed);
  }
}

/**
 * 控制動畫播放/暫停
 */
export function setAnimationPlayState(svg: SVGElement, playing: boolean): void {
  if (playing) {
    svg.classList.remove('animation-paused');
  } else {
    svg.classList.add('animation-paused');
  }

  // 控制 SMIL 動畫 - 使用 SVG root 的 API
  const svgRoot = svg.closest('svg') || svg;
  if ('unpauseAnimations' in svgRoot && 'pauseAnimations' in svgRoot) {
    if (playing) {
      (svgRoot as SVGSVGElement).unpauseAnimations();
    } else {
      (svgRoot as SVGSVGElement).pauseAnimations();
    }
  }
}

/**
 * 更新動畫速度
 */
export function updateAnimationSpeed(svg: SVGElement, speed: number): void {
  // 更新 CSS 動畫速度
  const dashPaths = svg.querySelectorAll('.dash-flow');
  dashPaths.forEach((path) => {
    (path as HTMLElement).style.setProperty('--animation-speed', `${1 / speed}s`);
  });

  // 更新 SMIL 動畫速度
  const animations = svg.querySelectorAll('animateMotion');
  animations.forEach((anim) => {
    anim.setAttribute('dur', `${2 / speed}s`);
  });
}
