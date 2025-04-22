// -------------------------------
// Suppress host validation and FBXLoader warnings
// -------------------------------
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args: any[]) => {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (
      msg.includes('Host validation failed') ||
      msg.includes('Host is not supported') ||
      msg.includes('Host is not valid or supported') ||
      msg.includes('insights whitelist') ||
      msg.includes('THREE.FBXLoader:')
    )
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args: any[]) => {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (
      msg.includes('Host validation failed') ||
      msg.includes('Host is not supported') ||
      msg.includes('Host is not valid or supported') ||
      msg.includes('insights whitelist') ||
      msg.includes('THREE.FBXLoader:')
    )
  ) {
    return;
  }
  originalError.apply(console, args);
};

// -------------------------------
// Your usual React entrypoint
// -------------------------------
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import App from './App';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
    <ToastContainer
      position="bottom-right"
      theme="dark"
      autoClose={3000}
    />
  </React.StrictMode>
);
