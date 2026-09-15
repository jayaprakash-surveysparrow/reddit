import { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './themeContext';

const STORAGE_KEY = 'reddit_clone_theme';

function readPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference);
  const [systemDark, setSystemDark] = useState(prefersDark);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setSystemDark(event.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const value = useMemo(() => {
    const apply = (next) => {
      setPreference(next);
      try {
        if (next === 'system') localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage can be unavailable (private mode); the theme still applies this session.
      }
    };
    return {
      theme,
      preference,
      setPreference: apply,
      toggleTheme: () => apply(theme === 'dark' ? 'light' : 'dark'),
    };
  }, [theme, preference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
