import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// заглушка на Warning: findDOMNode is deprecated and will be removed in the next major release.
const origError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes('findDOMNode is deprecated')) return;
  origError(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
