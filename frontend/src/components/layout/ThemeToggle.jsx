import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/themeContext';
import { IconButton } from '../ui/IconButton';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  return (
    <IconButton
      icon={theme === 'dark' ? Sun : Moon}
      label={`Switch to ${nextTheme} mode`}
      onClick={toggleTheme}
    />
  );
}
