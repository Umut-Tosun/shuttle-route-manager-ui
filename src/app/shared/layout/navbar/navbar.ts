import { Component, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  toggleSidebar = output<void>();
  isUserMenuOpen = false;
  
  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) {
    // Signal değişikliklerini takip et
    effect(() => {
      console.log('Dark mode:', this.themeService.isDarkMode());
    });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onLogout(): void {
    this.authService.logout();
  }
}