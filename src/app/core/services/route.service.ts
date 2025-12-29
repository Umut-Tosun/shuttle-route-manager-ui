import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Route, CreateRouteDto, UpdateRouteDto, RouteStop } from '../../core/models/route.model';

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private endpoint = '/routes';
  private stopEndpoint = '/routestops';

  constructor(private apiService: ApiService) {}

  // Routes
  getAll(): Observable<ApiResponse<Route[]>> {
    return this.apiService.get<ApiResponse<Route[]>>(this.endpoint);
  }

  getById(id: string): Observable<ApiResponse<Route>> {
    return this.apiService.get<ApiResponse<Route>>(`${this.endpoint}/${id}`);
  }

  create(route: CreateRouteDto): Observable<ApiResponse<Route>> {
    return this.apiService.post<ApiResponse<Route>>(this.endpoint, route);
  }

  update(route: UpdateRouteDto): Observable<ApiResponse<Route>> {
    return this.apiService.put<ApiResponse<Route>>(this.endpoint, route);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }

  // Route Stops
  getRouteStops(routeId: string): Observable<ApiResponse<RouteStop[]>> {
    return this.apiService.get<ApiResponse<RouteStop[]>>(`${this.stopEndpoint}/route/${routeId}`);
  }

  createRouteStop(stop: Partial<RouteStop>): Observable<ApiResponse<RouteStop>> {
    return this.apiService.post<ApiResponse<RouteStop>>(this.stopEndpoint, stop);
  }

  updateRouteStop(stop: RouteStop): Observable<ApiResponse<RouteStop>> {
    return this.apiService.put<ApiResponse<RouteStop>>(this.stopEndpoint, stop);
  }

  deleteRouteStop(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.stopEndpoint}/${id}`);
  }
}