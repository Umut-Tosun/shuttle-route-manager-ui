import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  isCollapsed = input<boolean>(false);
  
  menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'home', route: '/dashboard' },
  { label: 'Şirketler', icon: 'building', route: '/companies' },
  { label: 'Sürücüler', icon: 'user', route: '/drivers' },
  { label: 'Servisler', icon: 'bus', route: '/buses' },  // Değişti
  { label: 'Rotalar', icon: 'route', route: '/routes' },
  { label: 'Duraklar', icon: 'map-pin', route: '/stops' },
  { label: 'Seferler', icon: 'calendar', route: '/trips' },
];
}