import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RouteStop } from '../../core/models/route-stop.model';
import { Route } from '../../core/models/route.model';
import * as L from 'leaflet';
import { RouteStopService } from '../../core/services/route-stop.service';
import { RouteService } from '../../core/services/route.service';

@Component({
  selector: 'app-route-stops',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // FormsModule EKLE
  templateUrl: './stops.html',
  styleUrl: './stops.css'
})
export class RouteStopsComponent implements OnInit {
  routeStops: RouteStop[] = [];
  filteredRouteStops: RouteStop[] = [];
  routes: Route[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Filter
  selectedRouteFilter: string = '';

  // Add/Edit Modal with Map
  isModalOpen = false;
  isEditMode = false;
  routeStopForm: FormGroup;
  selectedStopId: string | null = null;
  private formMap: L.Map | null = null;
  private formMarker: L.Marker | null = null;
  selectedLat: number = 41.0082;
  selectedLng: number = 28.9784;

  // Detail Modal (Single Stop Map)
  isDetailModalOpen = false;
  selectedStop: RouteStop | null = null;
  private detailMap: L.Map | null = null;

  // Delete Modal
  isDeleteModalOpen = false;
  stopToDelete: RouteStop | null = null;
  isDeleting = false;

  constructor(
    private routeStopService: RouteStopService,
    private routeService: RouteService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.routeStopForm = this.fb.group({
      routeId: ['', [Validators.required]],
      sequenceNumber: ['', [Validators.required, Validators.min(1)]],
      city: ['', [Validators.required]],
      district: ['', [Validators.required]],
      address: ['', [Validators.required]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      estimatedArrivalTimeMorning: ['', [Validators.required]],
      estimatedArrivalTimeEvening: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadRouteStops();
    this.loadRoutes();
  }

  loadRouteStops(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    this.routeStopService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.routeStops = response.data.sort((a, b) => {
            if (a.routeId === b.routeId) {
              return a.sequenceNumber - b.sequenceNumber;
            }
            return 0;
          });
          this.applyFilter();
        } else {
          this.errorMessage = response.message || 'Veri yüklenemedi';
          this.routeStops = [];
          this.filteredRouteStops = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading route stops:', error);
        this.errorMessage = 'Duraklar yüklenirken bir hata oluştu';
        this.isLoading = false;
        this.routeStops = [];
        this.filteredRouteStops = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadRoutes(): void {
    this.routeService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.routes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading routes:', error);
      }
    });
  }

  applyFilter(): void {
    if (this.selectedRouteFilter) {
      this.filteredRouteStops = this.routeStops.filter(
        stop => stop.routeId === this.selectedRouteFilter
      );
    } else {
      this.filteredRouteStops = [...this.routeStops];
    }
    this.cdr.detectChanges();
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  clearFilter(): void {
    this.selectedRouteFilter = '';
    this.applyFilter();
  }

  // Add/Edit Modal
  openAddModal(): void {
    this.isEditMode = false;
    this.selectedStopId = null;
    this.routeStopForm.reset();
    this.selectedLat = 41.0082;
    this.selectedLng = 28.9784;
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.initFormMap();
    }, 100);
  }

  openEditModal(stop: RouteStop): void {
    this.isEditMode = true;
    this.selectedStopId = stop.id;
    this.selectedLat = Number(stop.latitude);
    this.selectedLng = Number(stop.longitude);
    
    this.routeStopForm.reset();
    this.routeStopForm.patchValue({
      routeId: stop.routeId,
      sequenceNumber: stop.sequenceNumber,
      city: stop.city,
      district: stop.district,
      address: stop.address,
      latitude: stop.latitude,
      longitude: stop.longitude,
      estimatedArrivalTimeMorning: this.formatTimeForInput(stop.estimatedArrivalTimeMorning),
      estimatedArrivalTimeEvening: this.formatTimeForInput(stop.estimatedArrivalTimeEvening)
    });
    
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.initFormMap();
    }, 100);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.routeStopForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedStopId = null;
    if (this.formMap) {
      this.formMap.remove();
      this.formMap = null;
      this.formMarker = null;
    }
    this.cdr.detectChanges();
  }

  initFormMap(): void {
    const mapElement = document.getElementById('form-map');
    if (!mapElement) return;

    this.formMap = L.map('form-map').setView([this.selectedLat, this.selectedLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.formMap);

    // Add marker
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
          📍
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    this.formMarker = L.marker([this.selectedLat, this.selectedLng], { 
      icon: customIcon,
      draggable: true 
    }).addTo(this.formMap);

    // Update coordinates when marker is dragged
    this.formMarker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      this.selectedLat = position.lat;
      this.selectedLng = position.lng;
      this.routeStopForm.patchValue({
        latitude: position.lat.toFixed(6),
        longitude: position.lng.toFixed(6)
      });
      this.cdr.detectChanges();
    });

    // Update marker when map is clicked
    this.formMap.on('click', (e) => {
      this.selectedLat = e.latlng.lat;
      this.selectedLng = e.latlng.lng;
      this.formMarker?.setLatLng(e.latlng);
      this.routeStopForm.patchValue({
        latitude: e.latlng.lat.toFixed(6),
        longitude: e.latlng.lng.toFixed(6)
      });
      this.cdr.detectChanges();
    });
  }

  onManualCoordinatesChange(): void {
    const lat = this.routeStopForm.get('latitude')?.value;
    const lng = this.routeStopForm.get('longitude')?.value;
    
    if (lat && lng) {
      this.selectedLat = parseFloat(lat);
      this.selectedLng = parseFloat(lng);
      this.formMarker?.setLatLng([this.selectedLat, this.selectedLng]);
      this.formMap?.setView([this.selectedLat, this.selectedLng], 13);
    }
  }

  onSubmit(): void {
    if (this.routeStopForm.invalid) {
      this.routeStopForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    const rawFormValue = this.routeStopForm.getRawValue();
    
    const formData = {
      routeId: rawFormValue.routeId,
      sequenceNumber: parseInt(rawFormValue.sequenceNumber),
      city: rawFormValue.city?.trim() || '',
      district: rawFormValue.district?.trim() || '',
      address: rawFormValue.address?.trim() || '',
      latitude: parseFloat(rawFormValue.latitude),
      longitude: parseFloat(rawFormValue.longitude),
      estimatedArrivalTimeMorning: rawFormValue.estimatedArrivalTimeMorning + ':00',
      estimatedArrivalTimeEvening: rawFormValue.estimatedArrivalTimeEvening + ':00'
    };

    if (this.isEditMode && this.selectedStopId) {
      const updateData = {
        id: this.selectedStopId,
        ...formData
      };
      
      this.routeStopService.update(updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.successMessage = 'Durak başarıyla güncellendi!';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.loadRouteStops();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Güncelleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Update Error:', error);
          this.errorMessage = error.error?.message || 'Durak güncellenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.routeStopService.create(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.successMessage = 'Durak başarıyla eklendi!';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.loadRouteStops();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Ekleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Create Error:', error);
          this.errorMessage = error.error?.message || 'Durak eklenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Detail Modal
  openDetailModal(stop: RouteStop): void {
    this.selectedStop = stop;
    this.isDetailModalOpen = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.initDetailMap();
    }, 100);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedStop = null;
    if (this.detailMap) {
      this.detailMap.remove();
      this.detailMap = null;
    }
    this.cdr.detectChanges();
  }

  initDetailMap(): void {
    if (!this.selectedStop) return;
    
    const mapElement = document.getElementById('detail-map');
    if (!mapElement) return;

    const lat = Number(this.selectedStop.latitude);
    const lng = Number(this.selectedStop.longitude);

    this.detailMap = L.map('detail-map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.detailMap);

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="background-color: #3b82f6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
          ${this.selectedStop.sequenceNumber}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.detailMap);
    
    marker.bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="font-weight: bold; margin-bottom: 8px;">Durak ${this.selectedStop.sequenceNumber}</h3>
        <p style="margin: 4px 0;"><strong>Adres:</strong> ${this.selectedStop.address}</p>
        <p style="margin: 4px 0;"><strong>İlçe:</strong> ${this.selectedStop.district}, ${this.selectedStop.city}</p>
      </div>
    `).openPopup();
  }

  // Delete Modal
  openDeleteModal(stop: RouteStop): void {
    this.stopToDelete = stop;
    this.isDeleteModalOpen = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.stopToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    if (!this.stopToDelete) return;

    this.isDeleting = true;
    this.cdr.detectChanges();
    
    this.routeStopService.delete(this.stopToDelete.id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.successMessage = 'Durak başarıyla silindi!';
          this.loadRouteStops();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Silme işlemi başarısız';
        }
        this.isDeleting = false;
        this.closeDeleteModal();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Durak silinirken bir hata oluştu';
        this.isDeleting = false;
        this.closeDeleteModal();
      }
    });
  }

  // Helpers
  formatTime(timeSpan: string): string {
    if (!timeSpan) return '-';
    return timeSpan.substring(0, 5);
  }

  formatTimeForInput(timeSpan: string): string {
    if (!timeSpan) return '';
    return timeSpan.substring(0, 5);
  }

  getRouteName(routeId: string): string {
    const route = this.routes.find(r => r.id === routeId);
    return route ? route.name : 'Bilinmiyor';
  }

  getErrorMessage(fieldName: string): string {
    const control = this.routeStopForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Bu alan zorunludur';
    }
    if (control?.hasError('min')) {
      return 'En az 1 olmalıdır';
    }
    return '';
  }
}