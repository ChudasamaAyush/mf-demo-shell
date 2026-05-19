export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  mode: ThemeMode;
  colorPrimary: string;
  colorBackground: string;
  colorSurface: string;
  colorText: string;
  colorTextMuted: string;
  colorBorder: string;
}

export type ThemeEvent = { type: 'theme:change'; mode: ThemeMode };
