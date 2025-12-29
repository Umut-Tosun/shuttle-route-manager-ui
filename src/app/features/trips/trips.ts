import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { Trip, TripType } from '../../core/models/trip.model';
import { Route } from '../../core/models/route.model';
import { RouteStop } from '../../core/models/route-stop.model';
import { AppUser, UserService } from '../../core/services/user.service';
import { TripService } from '../../core/services/trip.service';
import { RouteService } from '../../core/services/route.service';
import { RouteStopService } from '../../core/services/route-stop.service';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './trips.html',
  styleUrl: './trips.css'
})
export class TripsComponent implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  users: AppUser[] = [];
  routes: Route[] = [];
  routeStops: RouteStop[] = [];
  availableStops: RouteStop[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Filters
  selectedRouteFilter: string = '';
  selectedUserFilter: string = '';
  selectedTripTypeFilter: string = '';

  // Add/Edit Modal
  isModalOpen = false;
  isEditMode = false;
  tripForm: FormGroup;
  selectedTripId: string | null = null;

  // Delete Modal
  isDeleteModalOpen = false;
  tripToDelete: Trip | null = null;
  isDeleting = false;

  // TripType enum for template
  TripType = TripType;

  constructor(
    private tripService: TripService,
    private routeService: RouteService,
    private routeStopService: RouteStopService,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.tripForm = this.fb.group({
      appUserId: ['', [Validators.required]],
      routeId: ['', [Validators.required]],
      routeStopId: ['', [Validators.required]],
      tripType: ['', [Validators.required]],
      validFrom: ['', [Validators.required]],
      validUntil: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadTrips();
    this.loadUsers();
    this.loadRoutes();
  }

  loadTrips(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    this.tripService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.trips = response.data;
          this.applyFilters();
        } else {
          this.errorMessage = response.message || 'Veri yüklenemedi';
          this.trips = [];
          this.filteredTrips = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading trips:', error);
        this.errorMessage = 'Seferler yüklenirken bir hata oluştu';
        this.isLoading = false;
        this.trips = [];
        this.filteredTrips = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.users = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
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

  onRouteChange(): void {
    const routeId = this.tripForm.get('routeId')?.value;
    if (routeId) {
      this.routeStopService.getByRouteId(routeId).subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.availableStops = response.data.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
            this.tripForm.patchValue({ routeStopId: '' });
          }
        },
        error: (error) => {
          console.error('Error loading route stops:', error);
          this.availableStops = [];
        }
      });
    } else {
      this.availableStops = [];
      this.tripForm.patchValue({ routeStopId: '' });
    }
  }

  applyFilters(): void {
    let filtered = [...this.trips];

    if (this.selectedRouteFilter) {
      filtered = filtered.filter(trip => trip.routeId === this.selectedRouteFilter);
    }

    if (this.selectedUserFilter) {
      filtered = filtered.filter(trip => trip.appUserId === this.selectedUserFilter);
    }

    if (this.selectedTripTypeFilter) {
      filtered = filtered.filter(trip => trip.tripType.toString() === this.selectedTripTypeFilter);
    }

    this.filteredTrips = filtered;
    this.cdr.detectChanges();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedRouteFilter = '';
    this.selectedUserFilter = '';
    this.selectedTripTypeFilter = '';
    this.applyFilters();
  }

  // Add/Edit Modal
  openAddModal(): void {
    this.isEditMode = false;
    this.selectedTripId = null;
    this.tripForm.reset();
    this.availableStops = [];
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  openEditModal(trip: Trip): void {
    this.isEditMode = true;
    this.selectedTripId = trip.id;
    
    // Load stops for the selected route
    this.routeStopService.getByRouteId(trip.routeId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.availableStops = response.data.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        }
      }
    });
    
    this.tripForm.reset();
    this.tripForm.patchValue({
      appUserId: trip.appUserId,
      routeId: trip.routeId,
      routeStopId: trip.routeStopId,
      tripType: trip.tripType.toString(),
      validFrom: this.formatDateForInput(trip.validFrom),
      validUntil: this.formatDateForInput(trip.validUntil)
    });
    
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.tripForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedTripId = null;
    this.availableStops = [];
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    const rawFormValue = this.tripForm.getRawValue();
    
    const formData = {
      appUserId: rawFormValue.appUserId,
      routeId: rawFormValue.routeId,
      routeStopId: rawFormValue.routeStopId,
      tripType: parseInt(rawFormValue.tripType),
      validFrom: new Date(rawFormValue.validFrom).toISOString(),
      validUntil: new Date(rawFormValue.validUntil).toISOString()
    };

    if (this.isEditMode && this.selectedTripId) {
      const updateData = {
        id: this.selectedTripId,
        ...formData
      };
      
      this.tripService.update(updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.successMessage = 'Sefer başarıyla güncellendi!';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.loadTrips();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Güncelleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Update Error:', error);
          this.errorMessage = error.error?.message || 'Sefer güncellenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.tripService.create(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.successMessage = 'Sefer başarıyla eklendi!';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.loadTrips();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Ekleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Create Error:', error);
          this.errorMessage = error.error?.message || 'Sefer eklenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Delete Modal
  openDeleteModal(trip: Trip): void {
    this.tripToDelete = trip;
    this.isDeleteModalOpen = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.tripToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    if (!this.tripToDelete) return;

    this.isDeleting = true;
    this.cdr.detectChanges();
    
    this.tripService.delete(this.tripToDelete.id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.successMessage = 'Sefer başarıyla silindi!';
          this.loadTrips();
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
        this.errorMessage = error.error?.message || 'Sefer silinirken bir hata oluştu';
        this.isDeleting = false;
        this.closeDeleteModal();
      }
    });
  }

  // Helpers
  getTripTypeName(tripType: TripType): string {
    return tripType === TripType.Morning ? 'Sabah' : 'Akşam';
  }

  getTripTypeClass(tripType: TripType): string {
    return tripType === TripType.Morning 
      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
      : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400';
  }

  isActive(trip: Trip): boolean {
    const now = new Date();
    const validFrom = new Date(trip.validFrom);
    const validUntil = new Date(trip.validUntil);
    return now >= validFrom && now <= validUntil;
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR');
  }

  formatDateForInput(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Bilinmiyor';
  }

  getRouteName(routeId: string): string {
    const route = this.routes.find(r => r.id === routeId);
    return route ? route.name : 'Bilinmiyor';
  }

  getStopAddress(stopId: string): string {
    const stop = this.availableStops.find(s => s.id === stopId);
    return stop ? stop.address : 'Bilinmiyor';
  }

  getErrorMessage(fieldName: string): string {
    const control = this.tripForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Bu alan zorunludur';
    }
    return '';
  }
}