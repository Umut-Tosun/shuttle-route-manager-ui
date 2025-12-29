import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Route, RouteStop } from '../../core/models/route.model';
import { Bus } from '../../core/models/bus.model';
import { Driver } from '../../core/models/driver.model';
import * as L from 'leaflet';
import { RouteService } from '../../core/services/route.service';
import { BusService } from '../../core/services/bus.service';
import { DriverService } from '../../core/services/driver.service';

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './routes.html',
  styleUrl: './routes.css'
})
export class RoutesComponent implements OnInit {
  routes: Route[] = [];
  buses: Bus[] = [];
  drivers: Driver[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Add/Edit Modal
  isModalOpen = false;
  isEditMode = false;
  routeForm: FormGroup;
  selectedRouteId: string | null = null;

  // Detail Modal (Leaflet Map)
  isDetailModalOpen = false;
  selectedRoute: Route | null = null;
  routeStops: RouteStop[] = [];
  private map: L.Map | null = null;
  isLoadingStops = false;

  // Delete Modal
  isDeleteModalOpen = false;
  routeToDelete: Route | null = null;
  isDeleting = false;

  constructor(
    private routeService: RouteService,
    private busService: BusService,
    private driverService: DriverService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.routeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      startPoint: ['', [Validators.required]],
      endPoint: ['', [Validators.required]],
      morningStartTime: ['', [Validators.required]],
      eveningStartTime: ['', [Validators.required]],
      busId: ['', [Validators.required]],
      driverId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadRoutes();
    this.loadBuses();
    this.loadDrivers();
  }

  loadRoutes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    this.routeService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.routes = response.data;
        } else {
          this.errorMessage = response.message || 'Veri yüklenemedi';
          this.routes = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading routes:', error);
        this.errorMessage = 'Rotalar yüklenirken bir hata oluştu';
        this.isLoading = false;
        this.routes = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadBuses(): void {
    this.busService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.buses = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading buses:', error);
      }
    });
  }

  loadDrivers(): void {
    this.driverService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.drivers = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
      }
    });
  }

  // Add/Edit Modal
  openAddModal(): void {
    this.isEditMode = false;
    this.selectedRouteId = null;
    this.routeForm.reset();
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  openEditModal(route: Route): void {
    this.isEditMode = true;
    this.selectedRouteId = route.id;
    
    this.routeForm.reset();
    this.routeForm.patchValue({
      name: route.name,
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      morningStartTime: this.formatTimeForInput(route.morningStartTime),
      eveningStartTime: this.formatTimeForInput(route.eveningStartTime),
      busId: route.busId,
      driverId: route.driverId
    });
    
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.routeForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedRouteId = null;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    const rawFormValue = this.routeForm.getRawValue();
    
    const formData = {
      name: rawFormValue.name?.trim() || '',
      startPoint: rawFormValue.startPoint?.trim() || '',
      endPoint: rawFormValue.endPoint?.trim() || '',
      morningStartTime: rawFormValue.morningStartTime + ':00', // "08:00" -> "08:00:00"
      eveningStartTime: rawFormValue.eveningStartTime + ':00',
      busId: rawFormValue.busId,
      driverId: rawFormValue.driverId
    };

    if (this.isEditMode && this.selectedRouteId) {
      const updateData = {
        id: this.selectedRouteId,
        ...formData
      };
      
      this.routeService.update(updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.successMessage = 'Rota başarıyla güncellendi!';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.loadRoutes();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Güncelleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Update Error:', error);
          this.errorMessage = error.error?.message || 'Rota güncellenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.routeService.create(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.successMessage = 'Rota başarıyla eklendi!';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.loadRoutes();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Ekleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Create Error:', error);
          this.errorMessage = error.error?.message || 'Rota eklenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Detail Modal with Leaflet
  openDetailModal(route: Route): void {
    this.selectedRoute = route;
    this.isDetailModalOpen = true;
    this.routeStops = [];
    this.cdr.detectChanges();
    
    // Load route stops
    this.loadRouteStops(route.id);
    
    // Wait for DOM to render, then initialize map
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedRoute = null;
    this.routeStops = [];
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.cdr.detectChanges();
  }

  loadRouteStops(routeId: string): void {
    this.isLoadingStops = true;
    this.routeService.getRouteStops(routeId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.routeStops = response.data.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
          this.updateMapMarkers();
        }
        this.isLoadingStops = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading stops:', error);
        this.isLoadingStops = false;
        this.cdr.detectChanges();
      }
    });
  }

  initMap(): void {
    const mapElement = document.getElementById('route-map');
    if (!mapElement) return;

    // Default center: Istanbul
    this.map = L.map('route-map').setView([41.0082, 28.9784], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.updateMapMarkers();
  }

  updateMapMarkers(): void {
    if (!this.map || this.routeStops.length === 0) return;

    // Clear existing markers
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        this.map?.removeLayer(layer);
      }
    });

    const coordinates: [number, number][] = [];

    // Add markers for each stop
    this.routeStops.forEach((stop, index) => {
      const lat = Number(stop.latitude);
      const lng = Number(stop.longitude);
      coordinates.push([lat, lng]);

      // Custom icon based on position
      let iconColor = 'blue';
      if (index === 0) iconColor = 'green'; // Start
      if (index === this.routeStops.length - 1) iconColor = 'red'; // End

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="background-color: ${iconColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
            ${stop.sequenceNumber}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map!);
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">Durak ${stop.sequenceNumber}</h3>
          <p style="margin: 4px 0;"><strong>Adres:</strong> ${stop.address}</p>
          <p style="margin: 4px 0;"><strong>İlçe:</strong> ${stop.district}, ${stop.city}</p>
          <hr style="margin: 8px 0;">
          <p style="margin: 4px 0;"><strong>Sabah:</strong> ${this.formatTime(stop.estimatedArrivalTimeMorning)}</p>
          <p style="margin: 4px 0;"><strong>Akşam:</strong> ${this.formatTime(stop.estimatedArrivalTimeEvening)}</p>
        </div>
      `);
    });

    // Draw polyline connecting all stops
    if (coordinates.length > 1) {
      const polyline = L.polyline(coordinates, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7
      }).addTo(this.map!);
      
      // Fit map to show all stops
      this.map!.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } else if (coordinates.length === 1) {
      this.map!.setView(coordinates[0], 15);
    }
  }

  // Delete Modal
  openDeleteModal(route: Route): void {
    this.routeToDelete = route;
    this.isDeleteModalOpen = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.routeToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    if (!this.routeToDelete) return;

    this.isDeleting = true;
    this.cdr.detectChanges();
    
    this.routeService.delete(this.routeToDelete.id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.successMessage = 'Rota başarıyla silindi!';
          this.loadRoutes();
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
        this.errorMessage = error.error?.message || 'Rota silinirken bir hata oluştu';
        this.isDeleting = false;
        this.closeDeleteModal();
      }
    });
  }

  // Helpers
  formatTime(timeSpan: string): string {
    if (!timeSpan) return '-';
    return timeSpan.substring(0, 5); // "08:00:00" -> "08:00"
  }

  formatTimeForInput(timeSpan: string): string {
    if (!timeSpan) return '';
    return timeSpan.substring(0, 5); // "08:00:00" -> "08:00"
  }

  getStopCount(route: Route): number {
    return route.routeStops?.length || 0;
  }

  getBusName(busId: string): string {
    const bus = this.buses.find(b => b.id === busId);
    return bus ? bus.plateNo : 'Bilinmiyor';
  }

  getDriverName(driverId: string): string {
    const driver = this.drivers.find(d => d.id === driverId);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'Bilinmiyor';
  }

  getErrorMessage(fieldName: string): string {
    const control = this.routeForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Bu alan zorunludur';
    }
    if (control?.hasError('minlength')) {
      return 'En az 3 karakter olmalıdır';
    }
    return '';
  }
}