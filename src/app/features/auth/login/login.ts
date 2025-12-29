import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ✅ Ekle
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.cdr.detectChanges();  // ✅ Change detection tetikle
          })
        )
        .subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.router.navigate(['/dashboard']);
            } else {
              const errorData = response.messages?.[0];
              this.errorMessage = errorData?.message || 
                                 errorData?.propertyName || 
                                 'Giriş başarısız';
              this.cdr.detectChanges();  // ✅ Change detection tetikle
            }
          },
          error: (error) => {
            const errorData = error.error?.messages?.[0];
            this.errorMessage = errorData?.message || 
                               errorData?.propertyName || 
                               'E-posta veya şifre hatalı';
            
            console.log('Error set:', this.errorMessage);
            this.cdr.detectChanges();  // ✅ Change detection tetikle
          }
        });
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}