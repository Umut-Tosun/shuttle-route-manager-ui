import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  // Reactive signal for current theme
  currentTheme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Initialize theme on service creation
    this.applyTheme(this.currentTheme());

    // Effect to persist theme changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.saveTheme(theme);
    });

    // Listen for system theme changes (optional)
    this.prefersDarkScheme.addEventListener('change', (e) => {
      const savedTheme = this.loadTheme();
      if (!savedTheme) {
        // Only auto-switch if user hasn't set a preference
        this.currentTheme.set(e.matches ? 'dark' : 'light');
      }
    });
  }

  private getInitialTheme(): Theme {
    // Check localStorage first
    const savedTheme = this.loadTheme();
    if (savedTheme) {
      return savedTheme;
    }

    // Otherwise use system preference
    return this.prefersDarkScheme.matches ? 'dark' : 'light';
  }

  private loadTheme(): Theme | null {
    try {
      const theme = localStorage.getItem(this.THEME_KEY);
      return theme === 'dark' || theme === 'light' ? theme : null;
    } catch {
      return null;
    }
  }

  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch {
      // Ignore localStorage errors
    }
  }

  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  toggleTheme(): void {
    this.currentTheme.set(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}

