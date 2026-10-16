import { writable } from 'svelte/store';

const KEY = 'ancemb-theme';

function initial() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
  }
  if (typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export const theme = writable(initial());

theme.subscribe((t) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', t === 'dark');
    try { localStorage.setItem(KEY, t); } catch {}
  }
});

export function toggleTheme() {
  theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
}
