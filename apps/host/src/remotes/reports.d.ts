import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'reports-dashboard': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
