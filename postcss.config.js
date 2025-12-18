import ensureFrom from './postcss-ensure-from.js';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    // Ensure `from` is set to avoid the PostCSS `from` warning
    ensureFrom(),
    tailwindcss,
    autoprefixer,
  ],
};
