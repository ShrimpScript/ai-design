import { lazy } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

const Product = lazy(() => import('./pages/Product'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Customers = lazy(() => import('./pages/Customers'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Demo = lazy(() => import('./pages/Demo'));
const NotFound = lazy(() => import('./pages/NotFound'));

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/product', element: <Product /> },
      { path: '/how-it-works', element: <HowItWorks /> },
      { path: '/customers', element: <Customers /> },
      { path: '/pricing', element: <Pricing /> },
      { path: '/demo', element: <Demo /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
