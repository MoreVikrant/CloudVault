const P = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  fo: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  plus: 'M12 5v14M5 12h14',
  se: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  up: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  gr: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7h-7zM13 13h7v7h-7z',
  li: 'M4 6h16M4 12h16M4 18h16',
  dl: 'M12 4v12M7 11l5 5 5-5M4 20h16',
  tr: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
};

export function Icon({ n, s = 18 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[n]} />
    </svg>
  );
}

export function Logo({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="CloudVault logo">
      <defs>
        <linearGradient id="lg" x1="4" y1="2" x2="36" y2="38"><stop stopColor="#ff6a00" /><stop offset="1" stopColor="#ffb04a" /></linearGradient>
      </defs>
      <path d="M20 2l15 8.5v19L20 38 5 29.5v-19z" fill="url(#lg)" />
      <path d="M13 22.5a4.5 4.5 0 01.6-8.9 6 6 0 0111.6 1.2 3.9 3.9 0 01-.4 7.7z" fill="#0a0807" />
      <circle cx="20" cy="19" r="2.4" fill="#fff1dc" />
      <path d="M20 20.5v3" stroke="#fff1dc" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
