export const Arrow = () => (
  <svg className="arrow" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Check = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
    <path d="M2.2 6.3 4.8 8.8 9.8 3.4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Alert = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <circle cx="7" cy="7" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 3.8v3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="7" cy="10" r="0.95" fill="currentColor" />
  </svg>
);
