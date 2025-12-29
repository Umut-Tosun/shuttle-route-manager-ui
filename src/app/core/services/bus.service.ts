import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Bus, CreateBusDto, UpdateBusDto } from '../../core/models/bus.model';

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private endpoint = '/buses';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ApiResponse<Bus[]>> {
    return this.apiService.get<ApiResponse<Bus[]>>(this.endpoint);
  }

  getById(id: string): Observable<ApiResponse<Bus>> {
    return this.apiService.get<ApiResponse<Bus>>(`${this.endpoint}/${id}`);
  }

  getByCompanyId(companyId: string): Observable<ApiResponse<Bus[]>> {
    return this.apiService.get<ApiResponse<Bus[]>>(`${this.endpoint}/company/${companyId}`);
  }

  create(bus: CreateBusDto): Observable<ApiResponse<Bus>> {
    return this.apiService.post<ApiResponse<Bus>>(this.endpoint, bus);
  }

  update(bus: UpdateBusDto): Observable<ApiResponse<Bus>> {
    return this.apiService.put<ApiResponse<Bus>>(this.endpoint, bus);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}