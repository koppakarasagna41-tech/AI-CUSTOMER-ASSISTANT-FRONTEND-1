/**
 * main.jsx — Application entry point
 *
 * Mounts the React tree into #root, wraps it with the
 * BrowserRouter so all pages can use React Router hooks,
 * and imports the global CSS (Tailwind + custom styles).
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
