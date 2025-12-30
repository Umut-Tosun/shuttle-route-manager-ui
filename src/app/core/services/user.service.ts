import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  homeCity: string;
  homeDistrict: string;
  homeAddress: string;
  homeLatitude: number;
  homeLongitude: number;
  defaultRouteStopId?: string;
  defaultRouteStop?: {
    id: string;
    sequenceNumber: number;
    address: string;
    city: string;
    district: string;
  };
  createdDate?: string | Date;
  lastUpdatedDate?: string | Date;
}

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  homeCity: string;
  homeDistrict: string;
  homeAddress: string;
  homeLatitude: number;
  homeLongitude: number;
  defaultRouteStopId?: string;
}

export interface UpdateUserDto {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  homeCity: string;
  homeDistrict: string;
  homeAddress: string;
  homeLatitude: number;
  homeLongitude: number;
  defaultRouteStopId?: string;
}

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private endpoint = '/users';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ApiResponse<AppUser[]>> {
    return this.apiService.get<ApiResponse<AppUser[]>>(this.endpoint);
  }

  getById(id: string): Observable<ApiResponse<AppUser>> {
    return this.apiService.get<ApiResponse<AppUser>>(`${this.endpoint}/${id}`);
  }

  register(user: RegisterUserDto): Observable<ApiResponse<AppUser>> {
    return this.apiService.post<ApiResponse<AppUser>>(`${this.endpoint}/register`, user);
  }

  update(user: UpdateUserDto): Observable<ApiResponse<AppUser>> {
    return this.apiService.put<ApiResponse<AppUser>>(this.endpoint, user);
  }
}