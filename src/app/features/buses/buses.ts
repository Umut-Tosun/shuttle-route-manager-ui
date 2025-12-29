import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { CompanyService } from '../companies/company.service';

import { Bus } from '../../core/models/bus.model';
import { Company } from '../../core/models/company.model';
import { Driver } from '../../core/models/driver.model';
import { BusService } from '../../core/services/bus.service';
import { DriverService } from '../../core/services/driver.service';

@Component({
  selector: 'app-buses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buses.html',
  styleUrl: './buses.css'
})
export class BusesComponent implements OnInit {
  buses: Bus[] = [];
  companies: Company[] = [];
  drivers: Driver[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Modal state
  isModalOpen = false;
  isEditMode = false;
  busForm: FormGroup;
  selectedBusId: string | null = null;

  // Delete confirmation state
  isDeleteModalOpen = false;
  busToDelete: Bus | null = null;
  isDeleting = false;

  // Current year for validation
  currentYear = new Date().getFullYear();

  constructor(
    private busService: BusService,
    private companyService: CompanyService,
    private driverService: DriverService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.busForm = this.fb.group({
      plateNo: ['', [Validators.required, Validators.maxLength(10)]],
      brand: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      year: ['', [Validators.required, Validators.min(1990), Validators.max(this.currentYear + 1)]],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      km: ['', [Validators.required, Validators.min(0)]],
      companyId: ['', [Validators.required]],
      defaultDriverId: ['']
    });
  }

  ngOnInit(): void {
    this.loadBuses();
    this.loadCompanies();
    this.loadDrivers();
  }

  loadBuses(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    this.busService.getAll().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        
        if (response.isSuccess && response.data) {
          this.buses = response.data;
          console.log('Buses loaded:', this.buses);
        } else {
          this.errorMessage = response.message || 'Veri yüklenemedi';
          this.buses = [];
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading buses:', error);
        this.errorMessage = 'Servisler yüklenirken bir hata oluştu';
        this.isLoading = false;
        this.buses = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.companies = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading companies:', error);
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

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedBusId = null;
    this.busForm.reset();
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  openEditModal(bus: Bus): void {
    console.log('Opening edit modal for bus:', bus);
    
    this.isEditMode = true;
    this.selectedBusId = bus.id;
    
    this.busForm.reset();
    
    this.busForm.patchValue({
      plateNo: bus.plateNo,
      brand: bus.brand,
      model: bus.model,
      year: bus.year,
      capacity: bus.capacity,
      km: bus.km,
      companyId: bus.companyId,
      defaultDriverId: bus.defaultDriverId || ''
    });
    
    console.log('Form after patchValue:', this.busForm.value);
    
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.busForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedBusId = null;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    console.log('=== FORM SUBMIT BAŞLADI ===');
    console.log('Form Valid:', this.busForm.valid);
    console.log('Form Value:', this.busForm.value);
    
    if (this.busForm.invalid) {
      this.busForm.markAllAsTouched();
      console.log('Form geçersiz, submit iptal edildi');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    const rawFormValue = this.busForm.getRawValue();
    
    const formData = {
      plateNo: rawFormValue.plateNo?.trim().toUpperCase() || '',
      brand: rawFormValue.brand?.trim() || '',
      model: rawFormValue.model?.trim() || '',
      year: parseInt(rawFormValue.year),
      capacity: parseInt(rawFormValue.capacity),
      km: parseFloat(rawFormValue.km),
      companyId: rawFormValue.companyId,
      defaultDriverId: rawFormValue.defaultDriverId || null
    };

    console.log('GÖNDERILECEK DATA:', formData);

    if (this.isEditMode && this.selectedBusId) {
      const updateData = {
        id: this.selectedBusId,
        ...formData
      };
      
      console.log('=== UPDATE REQUEST ===');
      console.log('Update Data:', updateData);
      
      this.busService.update(updateData).subscribe({
        next: (response) => {
          console.log('Update Response:', response);
          this.isLoading = false;
          
          if (response.isSuccess) {
            this.successMessage = 'Servis başarıyla güncellendi!';
            this.cdr.detectChanges();
            
            setTimeout(() => {
              this.loadBuses();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Güncelleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Update Error:', error);
          this.errorMessage = error.error?.message || 'Servis güncellenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      console.log('=== CREATE REQUEST ===');
      console.log('Create Data:', formData);
      
      this.busService.create(formData).subscribe({
        next: (response) => {
          console.log('Create Response:', response);
          this.isLoading = false;
          
          if (response.isSuccess) {
            this.successMessage = 'Servis başarıyla eklendi!';
            this.cdr.detectChanges();
            
            setTimeout(() => {
              this.loadBuses();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Ekleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Create Error:', error);
          this.errorMessage = error.error?.message || 'Servis eklenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  openDeleteModal(bus: Bus): void {
    this.busToDelete = bus;
    this.isDeleteModalOpen = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.busToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    if (!this.busToDelete) return;

    this.isDeleting = true;
    this.cdr.detectChanges();
    
    this.busService.delete(this.busToDelete.id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.successMessage = 'Servis başarıyla silindi!';
          this.loadBuses();
          
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
        this.errorMessage = error.error?.message || 'Servis silinirken bir hata oluştu';
        this.isDeleting = false;
        this.closeDeleteModal();
      }
    });
  }

  getCompanyName(companyId: string): string {
    const company = this.companies.find(c => c.id === companyId);
    return company ? company.name : 'Bilinmiyor';
  }

  getDriverName(driverId: string): string {
    const driver = this.drivers.find(d => d.id === driverId);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'Bilinmiyor';
  }

  getErrorMessage(fieldName: string): string {
    const control = this.busForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Bu alan zorunludur';
    }
    if (control?.hasError('minlength')) {
      return 'En az 2 karakter olmalıdır';
    }
    if (control?.hasError('maxlength')) {
      return 'En fazla 10 karakter olabilir';
    }
    if (control?.hasError('min')) {
      if (fieldName === 'year') return '1990 ve sonrası olmalıdır';
      if (fieldName === 'capacity') return 'En az 1 olmalıdır';
      if (fieldName === 'km') return '0 veya daha büyük olmalıdır';
    }
    if (control?.hasError('max')) {
      if (fieldName === 'year') return `En fazla ${this.currentYear + 1} olabilir`;
      if (fieldName === 'capacity') return 'En fazla 100 olabilir';
    }
    return '';
  }
}