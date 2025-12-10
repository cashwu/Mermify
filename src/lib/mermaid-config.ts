import mermaid from 'mermaid';
import { getTheme, type ThemeName } from './themes';

export const initMermaid = () => {
  // 基本初始化，使用預設深色主題
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
    },
  });
};

/**
 * 取得指定主題的 Mermaid themeVariables 配置
 */
export const getMermaidThemeVariables = (themeName: ThemeName) => {
  const theme = getTheme(themeName);
  return {
    primaryColor: theme.nodeBackground,
    primaryTextColor: theme.textColor,
    primaryBorderColor: theme.nodeBorder,
    lineColor: theme.lineColor,
    secondaryColor: theme.nodeBackground,
    tertiaryColor: theme.nodeBackground,
    background: theme.background,
    mainBkg: theme.nodeBackground,
    nodeBorder: theme.nodeBorder,
    clusterBkg: theme.nodeBackground,
    clusterBorder: theme.clusterBorder,
    titleColor: theme.textColor,
    edgeLabelBackground: theme.edgeLabelBackground,
  };
};

export const DEFAULT_MERMAID_CODE = `flowchart LR
    A[User Request] --> B{API Gateway}
    B --> C[Auth Service]
    C --> D{Authorized?}
    D -->|Yes| E[Process Request]
    D -->|No| F[Return 401]
    E --> G[Database]
    G --> H[Response]
    H --> I[User]
`;

export const renderMermaid = async (code: string, id: string): Promise<string> => {
  try {
    const { svg } = await mermaid.render(id, code);
    return svg;
  } catch (error) {
    console.error('Mermaid render error:', error);
    throw error;
  }
};

/**
 * 使用指定主題渲染 Mermaid 圖表
 * 每次渲染前重新初始化 Mermaid 以套用主題配色
 */
export const renderMermaidWithTheme = async (
  code: string,
  id: string,
  themeName: ThemeName
): Promise<string> => {
  const theme = getTheme(themeName);

  // 重新初始化 Mermaid 以套用新主題
  mermaid.initialize({
    startOnLoad: false,
    theme: theme.isDark ? 'dark' : 'default',
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
    },
    themeVariables: getMermaidThemeVariables(themeName),
  });

  try {
    const { svg } = await mermaid.render(id, code);
    return svg;
  } catch (error) {
    console.error('Mermaid render error:', error);
    throw error;
  }
};
