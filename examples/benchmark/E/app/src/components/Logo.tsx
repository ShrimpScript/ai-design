/** Tidemark mark: an E-graduated staff gauge cut by the waterline (the "tidemark"). */
export function Mark({ size = 28, title }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <g fill="currentColor">
        <rect x="8" y="3" width="4" height="15" rx="1" />
        <rect x="8" y="25" width="4" height="4" rx="1" />
        <rect x="12" y="3" width="12" height="3.2" rx="1" />
        <rect x="12" y="9.4" width="7" height="3.2" rx="1" />
      </g>
      <rect x="3" y="20" width="26" height="3.4" rx="1.7" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <Mark size={30} />
      <span className="wordmark">tidemark</span>
    </span>
  );
}
