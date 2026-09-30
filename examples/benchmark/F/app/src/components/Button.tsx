import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { preloadRoute } from '../routes';

type Variant = 'primary' | 'secondary' | 'quiet';
type Common = { variant?: Variant; size?: 'md' | 'lg'; children: ReactNode; className?: string };

const cls = (v: Variant, s: 'md' | 'lg', extra?: string) => `btn btn--${v} btn--${s} ${extra ?? ''}`.trim();

export function ButtonLink({ to, variant = 'primary', size = 'md', children, className }: Common & { to: string }) {
  return (
    <Link
      to={to}
      className={cls(variant, size, className)}
      onMouseEnter={() => preloadRoute(to)}
      onFocus={() => preloadRoute(to)}
    >
      <span className="btn__label">{children}</span>
    </Link>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cls(variant, size, className)} {...rest}>
      <span className="btn__label">{children}</span>
    </button>
  );
}
