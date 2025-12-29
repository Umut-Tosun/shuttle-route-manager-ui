import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Driver, CreateDriverDto, UpdateDriverDto } from '../../core/models/driver.model';

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private endpoint = '/drivers';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ApiResponse<Driver[]>> {
    return this.apiService.get<ApiResponse<Driver[]>>(this.endpoint);
  }

  getById(id: string): Observable<ApiResponse<Driver>> {
    return this.apiService.get<ApiResponse<Driver>>(`${this.endpoint}/${id}`);
  }

  getByCompanyId(companyId: string): Observable<ApiResponse<Driver[]>> {
    return this.apiService.get<ApiResponse<Driver[]>>(`${this.endpoint}/company/${companyId}`);
  }

  create(driver: CreateDriverDto): Observable<ApiResponse<Driver>> {
    return this.apiService.post<ApiResponse<Driver>>(this.endpoint, driver);
  }

  update(driver: UpdateDriverDto): Observable<ApiResponse<Driver>> {
    return this.apiService.put<ApiResponse<Driver>>(this.endpoint, driver);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}