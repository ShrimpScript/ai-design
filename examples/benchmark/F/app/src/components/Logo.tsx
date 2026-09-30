type Props = { className?: string; onDark?: boolean };

/** Staff-gauge mark: a depth board with the day's high-water line across it. */
export function LogoMark({ size = 28, onDark = false }: { size?: number; onDark?: boolean }) {
  const ink = onDark ? '#e8f0f3' : '#0f2436';
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <path d="M7 2v24" stroke={ink} strokeWidth="2.4" />
      <path d="M7 4h9M7 8h5M7 12h9M7 16h5" stroke={ink} strokeWidth="2" />
      <rect x="1" y="18" width="26" height="8" fill="#4a95bd" />
      <path d="M1 18h26" stroke="#f5c518" strokeWidth="2.6" />
      <path d="M7 18v8" stroke={ink} strokeWidth="2.4" />
    </svg>
  );
}

export default function Logo({ className, onDark }: Props) {
  return (
    <span className={`logo ${className ?? ''}`}>
      <LogoMark onDark={onDark} />
      <span className="logo__word">Tidemark</span>
    </span>
  );
}
