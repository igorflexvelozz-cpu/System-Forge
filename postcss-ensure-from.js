export default function ensureFrom() {
  return {
    postcssPlugin: 'postcss-ensure-from',
    Once(root, { result }) {
      // Ensure result.opts.from is set so PostCSS plugins that expect it won't warn
      if (!result.opts) result.opts = {};
      if (!result.opts.from) result.opts.from = 'stdin';
    },
  };
}

export const postcss = true;
