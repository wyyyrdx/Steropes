export function generateFrameSvg(seed: string, label: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:hsl(${hue}, 30%, 15%);stop-opacity:1" />
        <stop offset="100%" style="stop-color:hsl(${(hue + 40) % 360}, 40%, 10%);stop-opacity:1" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad-${hash})" />
    <rect width="100%" height="100%" fill="url(#grid)" />
    
    <rect x="120" y="80" width="160" height="140" fill="none" stroke="hsl(${hue}, 80%, 60%)" stroke-width="2" stroke-dasharray="4 4"/>
    <rect x="120" y="60" width="80" height="20" fill="hsl(${hue}, 80%, 60%)" />
    <text x="125" y="74" font-family="sans-serif" font-size="10" font-weight="bold" fill="#000">${label.toUpperCase()}</text>
    
    <rect x="0" y="270" width="100%" height="30" fill="rgba(0,0,0,0.5)" />
    <text x="10" y="290" font-family="monospace" font-size="12" fill="#aaaaaa">${seed}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
