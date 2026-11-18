import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource/inter/latin-200.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-800.css';
import '@fontsource/inter/latin-900.css';
import './styles.css';
import { App } from './App';

const root = document.getElementById('root')!;
const app = <React.StrictMode><App initialPath={window.location.pathname} /></React.StrictMode>;
if (root.querySelector('main')) hydrateRoot(root, app);
else createRoot(root).render(app);
