import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Trip, CreateTripDto, UpdateTripDto } from '../../core/models/trip.model';

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private endpoint = '/tripappusers';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ApiResponse<Trip[]>> {
    return this.apiService.get<ApiResponse<Trip[]>>(this.endpoint);
  }

  getById(id: string): Observable<ApiResponse<Trip>> {
    return this.apiService.get<ApiResponse<Trip>>(`${this.endpoint}/${id}`);
  }

  getByUserId(userId: string): Observable<ApiResponse<Trip[]>> {
    return this.apiService.get<ApiResponse<Trip[]>>(`${this.endpoint}/user/${userId}`);
  }

  getByRouteId(routeId: string): Observable<ApiResponse<Trip[]>> {
    return this.apiService.get<ApiResponse<Trip[]>>(`${this.endpoint}/route/${routeId}`);
  }

  create(trip: CreateTripDto): Observable<ApiResponse<Trip>> {
    return this.apiService.post<ApiResponse<Trip>>(this.endpoint, trip);
  }

  update(trip: UpdateTripDto): Observable<ApiResponse<Trip>> {
    return this.apiService.put<ApiResponse<Trip>>(this.endpoint, trip);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}