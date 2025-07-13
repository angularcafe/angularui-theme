export type Theme = 'light' | 'dark' | 'system';

export type ThemeStrategy = 'attribute' | 'class';

export interface ThemeConfig {
  defaultTheme?: Theme;
  storageKey?: string;
  strategy?: ThemeStrategy;
  enableAutoInit?: boolean;
  enableColorScheme?: boolean;
  enableSystem?: boolean;
  forcedTheme?: Theme;
}

export type ValidatedThemeConfig = Required<Omit<ThemeConfig, 'forcedTheme'>> & { forcedTheme?: Theme }; 