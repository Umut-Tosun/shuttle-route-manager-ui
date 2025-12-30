// landing.component.ts
import { Component, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';

interface Feature {
  title: string;
  description: string;
  iconPath: string;
}

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  message: string;
  rating: number;
  avatar: string;
}

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent {
  router = inject(Router);
  themeService = inject(ThemeService);
  isMobileMenuOpen = false;
  isImageModalOpen = false;
  selectedImage: { src: string; title: string; description: string } | null = null;
  showSuccessMessage = false;

  features: Feature[] = [
    {
      title: 'Şirket Yönetimi',
      description: 'Birden fazla taşımacılık şirketini tek platformdan yönetin.',
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },
    {
      title: 'Sürücü Takibi',
      description: 'Tüm sürücülerinizi izleyin ve atamalarını kolayca yapın.',
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    {
      title: 'Rota Planlama',
      description: 'Optimize edilmiş rotalar oluşturun ve durakları yönetin.',
      iconPath: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
    },
    {
      title: 'Filo Yönetimi',
      description: 'Otobüs filonuzu tek ekrandan kontrol edin ve bakımları takip edin.',
      iconPath: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
    },
    {
      title: 'Sefer Takibi',
      description: 'Tüm seferleri anlık olarak izleyin ve raporlayın.',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      title: 'Raporlama',
      description: 'Detaylı raporlar ve analizlerle veriye dayalı kararlar alın.',
      iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    }
  ];

  pricingPlans: PricingPlan[] = [
    {
      name: 'Başlangıç',
      price: '₺999',
      features: [
        '1 Şirket',
        '10 Sürücü',
        '5 Otobüs',
        'Temel Raporlar',
        'E-posta Desteği'
      ]
    },
    {
      name: 'Profesyonel',
      price: '₺2.499',
      popular: true,
      features: [
        '5 Şirket',
        '50 Sürücü',
        '25 Otobüs',
        'Gelişmiş Raporlar',
        'Öncelikli Destek',
        'API Erişimi'
      ]
    },
    {
      name: 'Kurumsal',
      price: '₺4.999',
      features: [
        'Sınırsız Şirket',
        'Sınırsız Sürücü',
        'Sınırsız Otobüs',
        'Özel Raporlar',
        '7/24 Destek',
        'API Erişimi',
        'Özel Entegrasyonlar'
      ]
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Mehmet Yılmaz',
      role: 'Operasyon Müdürü',
      company: 'ABC Taşımacılık',
      message: 'Shuttle Manager sayesinde operasyonlarımızı %40 daha verimli hale getirdik. Rota planlaması ve sürücü takibi artık çok kolay.',
      rating: 5,
      avatar: 'M.Y'
    },
    {
      name: 'Ayşe Demir',
      role: 'Genel Müdür',
      company: 'XYZ Servis Hizmetleri',
      message: 'Müşterilerimizden aldığımız geri bildirimler çok olumlu. Sistem çok kullanıcı dostu ve raporlama özellikleri harika.',
      rating: 5,
      avatar: 'A.D'
    },
    {
      name: 'Can Öztürk',
      role: 'İşletme Sahibi',
      company: 'Öztürk Turizm',
      message: 'Filomuzun bakım takibini yapmak hiç bu kadar kolay olmamıştı. Müşteri desteği de çok hızlı ve çözüm odaklı.',
      rating: 5,
      avatar: 'C.Ö'
    }
  ];

  contactForm: ContactForm = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  submitContact() {
    if (this.contactForm.name && this.contactForm.email && this.contactForm.message) {
      console.log('📧 İletişim formu gönderildi:', this.contactForm);
      
      // Success message göster
      this.showSuccessMessage = true;
      
      // Formu sıfırla
      this.contactForm = {
        name: '',
        email: '',
        phone: '',
        message: ''
      };

      // 5 saniye sonra success message'ı gizle
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);
    } else {
      alert('Lütfen tüm zorunlu alanları doldurun.');
    }
  }

  openImageModal(src: string, title: string, description: string) {
    this.selectedImage = { src, title, description };
    this.isImageModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeImageModal() {
    this.isImageModalOpen = false;
    this.selectedImage = null;
    document.body.style.overflow = 'auto';
  }
}