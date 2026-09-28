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
  if (state.theme === 'dark') return true;
  if (state.theme === 'light') return false;
  return systemDark;
}
