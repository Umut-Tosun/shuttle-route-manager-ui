import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RouteStop } from '../../core/models/route-stop.model';
import * as L from 'leaflet';
import { AppUser, UserService } from '../../core/services/user.service';
import { RouteStopService } from '../../core/services/route-stop.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  filteredUsers: AppUser[] = [];
  routeStops: RouteStop[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Filter
  searchTerm: string = '';

  // Detail Modal (View only + Map)
  isDetailModalOpen = false;
  selectedUser: AppUser | null = null;
  private detailMap: L.Map | null = null;

  // Add/Edit Modal (Form + Map)
  isModalOpen = false;
  isEditMode = false;
  userForm: FormGroup;
  selectedUserId: string | null = null;
  private editMap: L.Map | null = null;
  private editMarker: L.Marker | null = null;
  selectedLat: number = 41.0082;
  selectedLng: number = 28.9784;

  constructor(
    private userService: UserService,
    private routeStopService: RouteStopService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required]],
      homeCity: ['', [Validators.required]],
      homeDistrict: ['', [Validators.required]],
      homeAddress: ['', [Validators.required]],
      homeLatitude: ['', [Validators.required]],
      homeLongitude: ['', [Validators.required]],
      defaultRouteStopId: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRouteStops();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    this.userService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.users = response.data;
          this.applyFilter();
        } else {
          this.errorMessage = response.message || 'Veri yüklenemedi';
          this.users = [];
          this.filteredUsers = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Kullanıcılar yüklenirken bir hata oluştu';
        this.isLoading = false;
        this.users = [];
        this.filteredUsers = [];
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

  applyFilter(): void {
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phoneNumber.includes(search)
      );
    } else {
      this.filteredUsers = [...this.users];
    }
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  // Detail Modal
  openDetailModal(user: AppUser): void {
    this.selectedUser = user;
    this.isDetailModalOpen = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.initDetailMap();
    }, 100);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedUser = null;
    if (this.detailMap) {
      this.detailMap.remove();
      this.detailMap = null;
    }
    this.cdr.detectChanges();
  }

  initDetailMap(): void {
    if (!this.selectedUser) return;
    
    const mapElement = document.getElementById('detail-map');
    if (!mapElement) return;

    const lat = Number(this.selectedUser.homeLatitude);
    const lng = Number(this.selectedUser.homeLongitude);

    this.detailMap = L.map('detail-map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.detailMap);

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="background-color: #8b5cf6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
          🏠
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.detailMap);
    
    marker.bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="font-weight: bold; margin-bottom: 8px;">${this.selectedUser.firstName} ${this.selectedUser.lastName}</h3>
        <p style="margin: 4px 0;"><strong>Adres:</strong> ${this.selectedUser.homeAddress}</p>
        <p style="margin: 4px 0;"><strong>İlçe:</strong> ${this.selectedUser.homeDistrict}, ${this.selectedUser.homeCity}</p>
      </div>
    `).openPopup();
  }

  // Add/Edit Modal
  openAddModal(): void {
    this.isEditMode = false;
    this.selectedUserId = null;
    this.selectedLat = 41.0082;
    this.selectedLng = 28.9784;
    
    this.userForm.reset({
      homeLatitude: this.selectedLat,
      homeLongitude: this.selectedLng
    });
    
    // Password alanını zorunlu yap (ekleme modunda)
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.initEditMap();
    }, 100);
  }

  openEditModal(user: AppUser): void {
    this.isEditMode = true;
    this.selectedUserId = user.id;
    this.selectedLat = Number(user.homeLatitude);
    this.selectedLng = Number(user.homeLongitude);
    
    this.userForm.reset();
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      homeCity: user.homeCity,
      homeDistrict: user.homeDistrict,
      homeAddress: user.homeAddress,
      homeLatitude: user.homeLatitude,
      homeLongitude: user.homeLongitude,
      defaultRouteStopId: user.defaultRouteStopId || ''
    });
    
    // Edit modunda password zorunlu değil, kaldır
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.initEditMap();
    }, 100);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.userForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedUserId = null;
    if (this.editMap) {
      this.editMap.remove();
      this.editMap = null;
      this.editMarker = null;
    }
    this.cdr.detectChanges();
  }

  initEditMap(): void {
    const mapElement = document.getElementById('edit-map');
    if (!mapElement) return;

    this.editMap = L.map('edit-map').setView([this.selectedLat, this.selectedLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.editMap);

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

    this.editMarker = L.marker([this.selectedLat, this.selectedLng], { 
      icon: customIcon,
      draggable: true 
    }).addTo(this.editMap);

    // Update coordinates when marker is dragged
    this.editMarker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      this.selectedLat = position.lat;
      this.selectedLng = position.lng;
      this.userForm.patchValue({
        homeLatitude: position.lat.toFixed(6),
        homeLongitude: position.lng.toFixed(6)
      });
      this.cdr.detectChanges();
    });

    // Update marker when map is clicked
    this.editMap.on('click', (e) => {
      this.selectedLat = e.latlng.lat;
      this.selectedLng = e.latlng.lng;
      this.editMarker?.setLatLng(e.latlng);
      this.userForm.patchValue({
        homeLatitude: e.latlng.lat.toFixed(6),
        homeLongitude: e.latlng.lng.toFixed(6)
      });
      this.cdr.detectChanges();
    });
  }

  onManualCoordinatesChange(): void {
    const lat = this.userForm.get('homeLatitude')?.value;
    const lng = this.userForm.get('homeLongitude')?.value;
    
    if (lat && lng) {
      this.selectedLat = parseFloat(lat);
      this.selectedLng = parseFloat(lng);
      this.editMarker?.setLatLng([this.selectedLat, this.selectedLng]);
      this.editMap?.setView([this.selectedLat, this.selectedLng], 13);
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    const rawFormValue = this.userForm.getRawValue();
    
    if (this.isEditMode && this.selectedUserId) {
      // UPDATE
      const formData = {
        id: this.selectedUserId,
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

      this.userService.update(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.successMessage = 'Kullanıcı başarıyla güncellendi!';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.loadUsers();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Güncelleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Update Error:', error);
          this.errorMessage = error.error?.message || 'Kullanıcı güncellenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // CREATE (REGISTER)
      const formData = {
        firstName: rawFormValue.firstName?.trim() || '',
        lastName: rawFormValue.lastName?.trim() || '',
        email: rawFormValue.email?.trim() || '',
        password: rawFormValue.password?.trim() || '',
        phoneNumber: rawFormValue.phoneNumber?.trim() || '',
        homeCity: rawFormValue.homeCity?.trim() || '',
        homeDistrict: rawFormValue.homeDistrict?.trim() || '',
        homeAddress: rawFormValue.homeAddress?.trim() || '',
        homeLatitude: parseFloat(rawFormValue.homeLatitude),
        homeLongitude: parseFloat(rawFormValue.homeLongitude),
        defaultRouteStopId: rawFormValue.defaultRouteStopId || undefined
      };

      this.userService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.successMessage = 'Kullanıcı başarıyla eklendi!';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.loadUsers();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Ekleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Create Error:', error);
          this.errorMessage = error.error?.message || 'Kullanıcı eklenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Helpers
  getDefaultStopName(stopId?: string): string {
    if (!stopId) return '-';
    const stop = this.routeStops.find(s => s.id === stopId);
    return stop ? `${stop.sequenceNumber}. ${stop.address}` : 'Bilinmiyor';
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Bu alan zorunludur';
    }
    if (control?.hasError('email')) {
      return 'Geçerli bir email adresi giriniz';
    }
    if (control?.hasError('minlength')) {
      return 'En az 6 karakter olmalıdır';
    }
    return '';
  }
}