import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface ProfileUser {
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
}

export interface UpdateProfileDto {
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

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private endpoint = '/users';

  constructor(private apiService: ApiService) {}

  getProfile(userId: string): Observable<ApiResponse<ProfileUser>> {
    return this.apiService.get<ApiResponse<ProfileUser>>(`${this.endpoint}/${userId}`);
  }

  updateProfile(profile: UpdateProfileDto): Observable<ApiResponse<ProfileUser>> {
    return this.apiService.put<ApiResponse<ProfileUser>>(this.endpoint, profile);
  }


}