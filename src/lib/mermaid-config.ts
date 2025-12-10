import mermaid from 'mermaid';

export const initMermaid = () => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
    },
    themeVariables: {
      primaryColor: '#1e293b',
      primaryTextColor: '#f1f5f9',
      primaryBorderColor: '#0ea5e9',
      lineColor: '#0ea5e9',
      secondaryColor: '#334155',
      tertiaryColor: '#1e293b',
      background: '#0f172a',
      mainBkg: '#1e293b',
      nodeBorder: '#0ea5e9',
      clusterBkg: '#1e293b',
      clusterBorder: '#475569',
      titleColor: '#f1f5f9',
      edgeLabelBackground: '#1e293b',
    },
  });
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
