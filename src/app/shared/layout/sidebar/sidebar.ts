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
  { label: 'Dashboard', icon: 'home', route: '/app/dashboard' },
  { label: 'Profilim', icon: 'user', route: '/app/profile' },
  { label: 'Şirketler', icon: 'building', route: '/app/companies' },
  { label: 'Sürücüler', icon: 'user', route: '/app/drivers' },
  { label: 'Servisler', icon: 'bus', route: '/app/buses' },
  { label: 'Rotalar', icon: 'route', route: '/app/routes' },
  { label: 'Duraklar', icon: 'map-pin', route: '/app/stops' },  
  { label: 'Seferler', icon: 'calendar', route: '/app/trips' },
  { label: 'Kullanıcılar', icon: 'user', route: '/app/users' },
];
}