import { useEffect, useState } from 'react';
import { useStore } from './store';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export function useIsWide(): boolean {
  return useMediaQuery('(min-width: 860px)');
}

export function useIsDark(): boolean {
  const { state } = useStore();
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const dark = state.theme === 'dark' ? true : state.theme === 'light' ? false : systemDark;

  // Vaul (and any other portal-to-body overlay) renders outside .pk-app, so it
  // only sees theme variables set on :root — keep documentElement in sync.
  useEffect(() => {
    document.documentElement.classList.toggle('pk-dark', dark);
  }, [dark]);

  return dark;
}
