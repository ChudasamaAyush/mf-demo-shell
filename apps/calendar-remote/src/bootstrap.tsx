import React from 'react';
import { createRoot } from 'react-dom/client';
import '@mf-demo/design-tokens/tokens.css';
import './styles.css';
import { Calendar } from './Calendar';

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');

createRoot(container).render(
  <React.StrictMode>
    <div style={{ padding: 24 }}>
      <h1>Calendar (standalone)</h1>
      <Calendar />
    </div>
  </React.StrictMode>,
);
