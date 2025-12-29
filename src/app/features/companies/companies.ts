// companies.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CompanyService } from './company.service';
import { Company } from '../../core/models/company.model';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './companies.html',
  styleUrl: './companies.css'
})
export class CompaniesComponent implements OnInit {
  companies: Company[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Modal state
  isModalOpen = false;
  isEditMode = false;
  companyForm: FormGroup;
  selectedCompanyId: string | null = null;

  constructor(
    private companyService: CompanyService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required]],
      responsiblePerson: ['', [Validators.required, Validators.minLength(2)]],
      responsiblePersonPhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      taxOffice: ['', [Validators.required]],
      taxNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      contractDate: ['', [Validators.required]],
      contractEndDate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    this.companyService.getAll().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        
        if (response.isSuccess && response.data) {
          this.companies = response.data;
          console.log('Companies loaded:', this.companies);
        } else {
          this.errorMessage = response.message || 'Veri yüklenemedi';
          this.companies = [];
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.errorMessage = 'Şirketler yüklenirken bir hata oluştu';
        this.isLoading = false;
        this.companies = [];
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedCompanyId = null;
    this.companyForm.reset();
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  openEditModal(company: Company): void {
    console.log('Opening edit modal for company:', company);
    
    this.isEditMode = true;
    this.selectedCompanyId = company.id;
    
    this.companyForm.reset(); // Önce formu temizle
    
    // Sonra değerleri set et
    this.companyForm.patchValue({
      name: company.name,
      address: company.address,
      responsiblePerson: company.responsiblePerson,
      responsiblePersonPhoneNumber: company.responsiblePersonPhoneNumber,
      taxOffice: company.taxOffice,
      taxNumber: company.taxNumber,
      contractDate: this.formatDateForInput(company.contractDate),
      contractEndDate: this.formatDateForInput(company.contractEndDate)
    });
    
    console.log('Form after patchValue:', this.companyForm.value);
    
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.companyForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedCompanyId = null;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    console.log('=== FORM SUBMIT BAŞLADI ===');
    console.log('Form Valid:', this.companyForm.valid);
    console.log('Form Value ÖNCE:', this.companyForm.value);
    console.log('Form Raw Value:', this.companyForm.getRawValue());
    
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      console.log('Form geçersiz, submit iptal edildi');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    
    // getRawValue() kullan - bu disabled alanları da içerir
    const rawFormValue = this.companyForm.getRawValue();
    
    console.log('Raw Form Value:', rawFormValue);
    
    const contractDate = new Date(rawFormValue.contractDate);
    const contractEndDate = new Date(rawFormValue.contractEndDate);
    
    const formData = {
      name: rawFormValue.name?.trim() || '',
      address: rawFormValue.address?.trim() || '',
      responsiblePerson: rawFormValue.responsiblePerson?.trim() || '',
      responsiblePersonPhoneNumber: rawFormValue.responsiblePersonPhoneNumber?.trim() || '',
      taxOffice: rawFormValue.taxOffice?.trim() || '',
      taxNumber: rawFormValue.taxNumber?.trim() || '',
      contractDate: contractDate.toISOString(),
      contractEndDate: contractEndDate.toISOString()
    };

    console.log('GÖNDERILECEK DATA:', formData);

    if (this.isEditMode && this.selectedCompanyId) {
      const updateData = {
        id: this.selectedCompanyId,
        ...formData
      };
      
      console.log('=== UPDATE REQUEST ===');
      console.log('Update Data:', updateData);
      
      this.companyService.update(updateData).subscribe({
        next: (response) => {
          console.log('Update Response:', response);
          this.isLoading = false;
          
          if (response.isSuccess) {
            this.successMessage = 'Şirket başarıyla güncellendi!';
            this.cdr.detectChanges();
            
            setTimeout(() => {
              this.loadCompanies();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Güncelleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Update Error:', error);
          this.errorMessage = error.error?.message || 'Şirket güncellenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      console.log('=== CREATE REQUEST ===');
      console.log('Create Data:', formData);
      
      this.companyService.create(formData).subscribe({
        next: (response) => {
          console.log('Create Response:', response);
          this.isLoading = false;
          
          if (response.isSuccess) {
            this.successMessage = 'Şirket başarıyla eklendi!';
            this.cdr.detectChanges();
            
            setTimeout(() => {
              this.loadCompanies();
              this.closeModal();
            }, 1000);
          } else {
            this.errorMessage = response.message || 'Ekleme başarısız';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Create Error:', error);
          this.errorMessage = error.error?.message || 'Şirket eklenirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onDelete(id: string): void {
    if (confirm('Bu şirketi silmek istediğinizden emin misiniz?')) {
      this.isLoading = true;
      this.cdr.detectChanges();
      
      this.companyService.delete(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.successMessage = 'Şirket başarıyla silindi!';
            this.loadCompanies();
            setTimeout(() => {
              this.successMessage = '';
              this.cdr.detectChanges();
            }, 3000);
          } else {
            this.errorMessage = response.message;
          }
          
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Şirket silinirken bir hata oluştu';
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error deleting company:', error);
        }
      });
    }
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
    const control = this.companyForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Bu alan zorunludur';
    }
    if (control?.hasError('minlength')) {
      return 'En az 2 karakter olmalıdır';
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'taxNumber') {
        return '10 haneli vergi numarası giriniz';
      }
      if (fieldName === 'responsiblePersonPhoneNumber') {
        return '10 haneli telefon numarası giriniz (5XXXXXXXXX)';
      }
    }
    return '';
  }
}