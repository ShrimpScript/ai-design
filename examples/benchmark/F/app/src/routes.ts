import { lazy } from 'react';

const loaders = {
  '/': () => import('./pages/Home'),
  '/product': () => import('./pages/Product'),
  '/how-it-works': () => import('./pages/HowItWorks'),
  '/customers': () => import('./pages/Customers'),
  '/pricing': () => import('./pages/Pricing'),
  '/demo': () => import('./pages/Demo'),
} as const;

type Path = keyof typeof loaders;

export const pages = {
  Home: lazy(loaders['/']),
  Product: lazy(loaders['/product']),
  HowItWorks: lazy(loaders['/how-it-works']),
  Customers: lazy(loaders['/customers']),
  Pricing: lazy(loaders['/pricing']),
  Demo: lazy(loaders['/demo']),
};

const done = new Set<string>();
export function preloadRoute(to: string) {
  const path = (to.split('?')[0] || '/') as Path;
  if (done.has(path) || !(path in loaders)) return;
  done.add(path);
  loaders[path]().catch(() => done.delete(path));
}

export function preloadAll() {
  (Object.keys(loaders) as Path[]).forEach(preloadRoute);
}

export const NAV = [
  { to: '/product', label: 'Product' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/customers', label: 'Customers' },
  { to: '/pricing', label: 'Pricing' },
];
