import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  stats: StatCard[] = [
    { title: 'Toplam Şirket', value: 12, change: 8, icon: 'building', color: 'blue' },
    { title: 'Aktif Sürücü', value: 48, change: 12, icon: 'user', color: 'green' },
    { title: 'Otobüs Sayısı', value: 35, change: 5, icon: 'bus', color: 'purple' },
    { title: 'Aktif Rota', value: 24, change: -3, icon: 'route', color: 'orange' },
    { title: 'Toplam Durak', value: 156, change: 15, icon: 'map-pin', color: 'pink' },
    { title: 'Günlük Sefer', value: 89, change: 22, icon: 'calendar', color: 'indigo' },
  ];

  recentActivities = [
    { action: 'Yeni şirket eklendi', detail: 'ABC Taşımacılık', time: '5 dakika önce', icon: 'plus', color: 'green' },
    { action: 'Rota güncellendi', detail: 'Kadıköy - Ataşehir', time: '12 dakika önce', icon: 'edit', color: 'blue' },
    { action: 'Sürücü atandı', detail: 'Ahmet Yılmaz - Rota 5', time: '25 dakika önce', icon: 'user-check', color: 'purple' },
    { action: 'Otobüs bakımda', detail: '34 ABC 123', time: '1 saat önce', icon: 'alert', color: 'orange' },
  ];

  ngOnInit(): void {
    console.log('Dashboard loaded');
  }
}