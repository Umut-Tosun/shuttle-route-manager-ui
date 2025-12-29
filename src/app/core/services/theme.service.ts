import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal(false);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.isDarkMode.set(savedTheme === 'dark' || (!savedTheme && prefersDark));
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode.update(value => !value);
    this.applyTheme();
    console.log('Theme toggled:', this.isDarkMode()); // 🔍 Debug
  }

  private applyTheme(): void {
    const theme = this.isDarkMode() ? 'dark' : 'light';
    
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
    console.log('Theme applied:', theme); // 🔍 Debug
  }
}