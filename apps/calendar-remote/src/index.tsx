// Async boundary so Module Federation can initialize the share scope before
// bootstrap.tsx (which imports React) starts running.
import('./bootstrap');
export {};
