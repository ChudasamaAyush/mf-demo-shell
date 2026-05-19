// Async boundary so Module Federation can initialize the share scope before
// main.tsx (which imports React + remote modules) starts running.
import('./main');
export {};
