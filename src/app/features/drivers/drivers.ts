import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { CompanyService } from '../companies/company.service';
import { Driver } from '../../core/models/driver.model';
import { Company } from '../../core/models/company.model';
import { DriverService } from '../../core/services/driver.service';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './drivers.html',
  styleUrl: './drivers.css'
})
export class DriversComponent implements OnInit {
  drivers: Driver[] = [];
  companies: Company[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Modal state
  isModalOpen = false;
  isEditMode = false;
  driverForm: FormGroup;
  selectedDriverId: string | null = null;

  // Delete confirmation state
  isDeleteModalOpen = false;
  driverToDelete: Driver | null = null;
  isDeleting = false;

  constructor(
    private driverService: DriverService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.driverForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      licenseNumber: ['', [Validators.required]],
      jobStartDate: ['', [Validators.required]],
      companyId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadDrivers();
    this.loadCompanies();
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    this.driverService.getAll().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        
        if (response.isSuccess && response.data) {
          this.drivers = response.data;
          console.log('Drivers loaded:', this.drivers);
        } else {
          this.errorMessage = response.message || 'Veri yüklenemedi';
          this.drivers = [];
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.errorMessage = 'Sürücüler yüklenirken bir hata oluştu';
        this.isLoading = false;
        this.drivers = [];
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

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedDriverId = null;
    this.driverForm.reset();
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  openEditModal(driver: Driver): void {
    console.log('Opening edit modal for driver:', driver);
    
    this.isEditMode = true;
    this.selectedDriverId = driver.id;
    
    this.driverForm.reset();
    
    this.driverForm.patchValue({
      firstName: driver.firstName,
      lastName: driver.lastName,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      jobStartDate: this.formatDateForInput(driver.jobStartDate),
      companyId: driver.companyId
    });
    
    console.log('Form after patchValue:', this.driverForm.value);
    
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.driverForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedDriverId = null;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    console.log('=== FORM SUBMIT BAŞLADI ===');
    console.log('Form Valid:', this.driverForm.valid);
    console.log('Form Value:', this.driverForm.value);
    
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      console.log('Form geçersiz, submit iptal edildi');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    const rawFormValue = this.driverForm.getRawValue();
    
    const jobStartDate = new Date(rawFormValue.jobStartDate);
    
    const formData = {
      firstName: rawFormValue.firstName?.trim() || '',
      lastName: rawFormValue.lastName?.trim() || '',
      phoneNumber: rawFormValue.phoneNumber?.trim() || '',
      licenseNumber: rawFormValue.licenseNumber?.trim() || '',
      jobStartDate: jobStartDate.toISOString(),
      companyId: rawFormValue.companyId
    };

    console.log('GÖNDERILECEK DATA:', formData);

    if (this.isEditMode && this.selectedDriverId) {
      const updateData = {
        id: this.selectedDriverId,
        ...formData
      };
      
      console.log('=== UPDATE REQUEST ===');
      console.log('Update Data:', updateData);
      
      this.driverService.update(updateData).subscribe({
        next: (response) => {
          console.log('Update Response:', response);
          this.isLoading = false;
          
          if (response.isSuccess) {
            this.successMessage = 'Sürücü başarıyla güncellendi!';
            this.cdr.detectChanges();
            
            setTimeout(() => {
              this.loadDrivers();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Güncelleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Update Error:', error);
          this.errorMessage = error.error?.message || 'Sürücü güncellenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      console.log('=== CREATE REQUEST ===');
      console.log('Create Data:', formData);
      
      this.driverService.create(formData).subscribe({
        next: (response) => {
          console.log('Create Response:', response);
          this.isLoading = false;
          
          if (response.isSuccess) {
            this.successMessage = 'Sürücü başarıyla eklendi!';
            this.cdr.detectChanges();
            
            setTimeout(() => {
              this.loadDrivers();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Ekleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Create Error:', error);
          this.errorMessage = error.error?.message || 'Sürücü eklenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  openDeleteModal(driver: Driver): void {
    this.driverToDelete = driver;
    this.isDeleteModalOpen = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.driverToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    if (!this.driverToDelete) return;

    this.isDeleting = true;
    this.cdr.detectChanges();
    
    this.driverService.delete(this.driverToDelete.id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.successMessage = 'Sürücü başarıyla silindi!';
          this.loadDrivers();
          
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
        this.errorMessage = error.error?.message || 'Sürücü silinirken bir hata oluştu';
        this.isDeleting = false;
        this.closeDeleteModal();
      }
    });
  }

  getCompanyName(companyId: string): string {
    const company = this.companies.find(c => c.id === companyId);
    return company ? company.name : 'Bilinmiyor';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('tr-TR');
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.driverForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Bu alan zorunludur';
    }
    if (control?.hasError('minlength')) {
      return 'En az 2 karakter olmalıdır';
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'phoneNumber') {
        return '10 haneli telefon numarası giriniz (5XXXXXXXXX)';
      }
    }
    return '';
  }
}