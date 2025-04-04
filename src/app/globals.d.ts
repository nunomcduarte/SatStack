// Import React types
import 'react';

// Make sure TypeScript recognizes the Next.js modules
declare module 'next' {
  export type Metadata = {
    title?: string;
    description?: string;
    [key: string]: any;
  };
}

declare module 'next/font/google' {
  export function Inter(options: { subsets: string[] }): {
    className: string;
    style: { fontFamily: string };
  };
}

// Override JSX element types to fix "JSX element implicitly has type 'any'" errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
} 