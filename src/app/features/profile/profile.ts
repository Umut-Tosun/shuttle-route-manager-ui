import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { RouteStop } from '../../core/models/route-stop.model';
import * as L from 'leaflet';
import { ProfileService, ProfileUser } from '../../core/services/profile.service';
import { RouteStopService } from '../../core/services/route-stop.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  user: ProfileUser | null = null;
  routeStops: RouteStop[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Tabs
  activeTab: 'profile' | 'security' = 'profile';

  // Profile Edit
  isEditMode = false;
  profileForm: FormGroup;
  
  // Map Modal
  isMapModalOpen = false;
  private mapModal: L.Map | null = null;
  private mapMarker: L.Marker | null = null;
  selectedLat: number = 41.0082;
  selectedLng: number = 28.9784;

  // Password Change
  passwordForm: FormGroup;

  constructor(
    private profileService: ProfileService,
    private routeStopService: RouteStopService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      homeCity: ['', [Validators.required]],
      homeDistrict: ['', [Validators.required]],
      homeAddress: ['', [Validators.required]],
      homeLatitude: ['', [Validators.required]],
      homeLongitude: ['', [Validators.required]],
      defaultRouteStopId: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadRouteStops();
  }

  loadProfile(): void {
    const userData = localStorage.getItem('user');
    if (!userData) {
      this.errorMessage = 'Kullanıcı bilgisi bulunamadı';
      return;
    }

    const user = JSON.parse(userData);
    const userId = user.id;

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.profileService.getProfile(userId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.user = response.data;
          this.selectedLat = Number(this.user.homeLatitude);
          this.selectedLng = Number(this.user.homeLongitude);
        } else {
          this.errorMessage = response.message || 'Profil yüklenemedi';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Profil yüklenirken bir hata oluştu';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRouteStops(): void {
    this.routeStopService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.routeStops = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading route stops:', error);
      }
    });
  }

  // Tab Navigation
  switchTab(tab: 'profile' | 'security'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  // Profile Edit
  enableEditMode(): void {
    if (!this.user) return;

    this.isEditMode = true;
    this.selectedLat = Number(this.user.homeLatitude);
    this.selectedLng = Number(this.user.homeLongitude);

    this.profileForm.reset();
    this.profileForm.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      phoneNumber: this.user.phoneNumber,
      homeCity: this.user.homeCity,
      homeDistrict: this.user.homeDistrict,
      homeAddress: this.user.homeAddress,
      homeLatitude: this.user.homeLatitude,
      homeLongitude: this.user.homeLongitude,
      defaultRouteStopId: this.user.defaultRouteStopId || ''
    });

    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  // Map Modal
  openMapModal(): void {
    this.isMapModalOpen = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.initMapModal();
    }, 100);
  }

  closeMapModal(): void {
    this.isMapModalOpen = false;
    if (this.mapModal) {
      this.mapModal.remove();
      this.mapModal = null;
      this.mapMarker = null;
    }
    this.cdr.detectChanges();
  }

  initMapModal(): void {
    const mapElement = document.getElementById('profile-map-modal');
    if (!mapElement) return;

    this.mapModal = L.map('profile-map-modal').setView([this.selectedLat, this.selectedLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapModal);

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="background-color: #8b5cf6; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
          🏠
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    this.mapMarker = L.marker([this.selectedLat, this.selectedLng], { 
      icon: customIcon,
      draggable: true 
    }).addTo(this.mapModal);

    // Update coordinates when marker is dragged
    this.mapMarker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      this.selectedLat = position.lat;
      this.selectedLng = position.lng;
      this.cdr.detectChanges();
    });

    // Update marker when map is clicked
    this.mapModal.on('click', (e) => {
      this.selectedLat = e.latlng.lat;
      this.selectedLng = e.latlng.lng;
      this.mapMarker?.setLatLng(e.latlng);
      this.cdr.detectChanges();
    });
  }

  confirmLocation(): void {
    this.profileForm.patchValue({
      homeLatitude: this.selectedLat.toFixed(6),
      homeLongitude: this.selectedLng.toFixed(6)
    });
    this.closeMapModal();
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid || !this.user) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    const rawFormValue = this.profileForm.getRawValue();
    
    const formData = {
      id: this.user.id,
      firstName: rawFormValue.firstName?.trim() || '',
      lastName: rawFormValue.lastName?.trim() || '',
      phoneNumber: rawFormValue.phoneNumber?.trim() || '',
      homeCity: rawFormValue.homeCity?.trim() || '',
      homeDistrict: rawFormValue.homeDistrict?.trim() || '',
      homeAddress: rawFormValue.homeAddress?.trim() || '',
      homeLatitude: parseFloat(rawFormValue.homeLatitude),
      homeLongitude: parseFloat(rawFormValue.homeLongitude),
      defaultRouteStopId: rawFormValue.defaultRouteStopId || undefined
    };

    this.profileService.updateProfile(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          this.successMessage = 'Profil başarıyla güncellendi!';
          
          // LocalStorage'daki user bilgisini güncelle
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            user.firstName = formData.firstName;
            user.lastName = formData.lastName;
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          this.cdr.detectChanges();
          setTimeout(() => {
            this.loadProfile();
            this.cancelEdit();
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Güncelleme başarısız';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Update Error:', error);
        this.errorMessage = error.error?.message || 'Profil güncellenirken bir hata oluştu';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Password Change
  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const formData = this.passwordForm.getRawValue();

    if (formData.newPassword !== formData.confirmPassword) {
      this.errorMessage = 'Yeni şifreler eşleşmiyor';
      return;
    }

    // Backend'de endpoint eklenince aktif olacak
    this.errorMessage = 'Şifre değiştirme özelliği henüz backend tarafında eklenmedi';
  }

  // Helpers
  getDefaultStopName(stopId?: string): string {
    if (!stopId) return '-';
    const stop = this.routeStops.find(s => s.id === stopId);
    return stop ? `${stop.sequenceNumber}. ${stop.address}` : 'Bilinmiyor';
  }

  getErrorMessage(fieldName: string, formGroup: FormGroup = this.profileForm): string {
    const control = formGroup.get(fieldName);
    if (control?.hasError('required')) {
      return 'Bu alan zorunludur';
    }
    if (control?.hasError('minlength')) {
      return 'En az 6 karakter olmalıdır';
    }
    return '';
  }
}