
import React, { createContext, useContext, useMemo } from 'react';
import { ThemeId, Theme, THEMES, DEFAULT_THEME, getTheme, ThemeKeywords } from './themes';

interface ThemeContextValue {
  themeId: ThemeId;
  theme: Theme;
  keywords: ThemeKeywords;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_THEME,
  theme: THEMES[DEFAULT_THEME],
  keywords: THEMES[DEFAULT_THEME].keywords,
});

interface ThemeProviderProps {
  themeId: ThemeId | undefined;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ themeId, children }) => {
  const value = useMemo(() => {
    const resolvedThemeId = themeId || DEFAULT_THEME;
    const theme = getTheme(resolvedThemeId);
    return {
      themeId: resolvedThemeId,
      theme,
      keywords: theme.keywords,
    };
  }, [themeId]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useKeywords = () => {
  const { keywords } = useTheme();
  return keywords;
};

export default ThemeContext;
