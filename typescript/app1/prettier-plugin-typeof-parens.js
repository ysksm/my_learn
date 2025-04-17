// Custom Prettier plugin to enforce parentheses around typeof expressions
export const parsers = {
  typescript: {
    preprocess(text, options) {
      // Replace all instances of 'typeof x' with '(typeof x)'
      // This is a simple regex-based approach
      return text.replace(/\b(typeof\s+\w+)(?!\s*\))/g, '($1)');
    }
  }
};
