import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '../../core/models/company.model';

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private endpoint = '/companies';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ApiResponse<Company[]>> {
    return this.apiService.get<ApiResponse<Company[]>>(this.endpoint);
  }

  getById(id: string): Observable<ApiResponse<Company>> {
    return this.apiService.get<ApiResponse<Company>>(`${this.endpoint}/${id}`);
  }

  create(company: CreateCompanyDto): Observable<ApiResponse<Company>> {
    return this.apiService.post<ApiResponse<Company>>(this.endpoint, company);
  }

  update(company: UpdateCompanyDto): Observable<ApiResponse<Company>> {
    return this.apiService.put<ApiResponse<Company>>(this.endpoint, company);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}




