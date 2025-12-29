import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { RouteStop, CreateRouteStopDto, UpdateRouteStopDto } from '../../core/models/route-stop.model';

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RouteStopService {
  private endpoint = '/routestops';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ApiResponse<RouteStop[]>> {
    return this.apiService.get<ApiResponse<RouteStop[]>>(this.endpoint);
  }

  getById(id: string): Observable<ApiResponse<RouteStop>> {
    return this.apiService.get<ApiResponse<RouteStop>>(`${this.endpoint}/${id}`);
  }

  getByRouteId(routeId: string): Observable<ApiResponse<RouteStop[]>> {
    return this.apiService.get<ApiResponse<RouteStop[]>>(`${this.endpoint}/route/${routeId}`);
  }

  create(stop: CreateRouteStopDto): Observable<ApiResponse<RouteStop>> {
    return this.apiService.post<ApiResponse<RouteStop>>(this.endpoint, stop);
  }

  update(stop: UpdateRouteStopDto): Observable<ApiResponse<RouteStop>> {
    return this.apiService.put<ApiResponse<RouteStop>>(this.endpoint, stop);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}