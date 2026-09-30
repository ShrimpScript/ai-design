import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import '@fontsource-variable/archivo/standard.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import { pages } from './routes';

const { Home, Product, HowItWorks, Customers, Pricing, Demo } = pages;

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'product', element: <Product /> },
      { path: 'how-it-works', element: <HowItWorks /> },
      { path: 'customers', element: <Customers /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'demo', element: <Demo /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
