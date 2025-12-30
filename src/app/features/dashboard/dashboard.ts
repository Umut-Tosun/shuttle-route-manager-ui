import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route } from '../../core/models/route.model';
import { RouteStop } from '../../core/models/route-stop.model';
import * as L from 'leaflet';
import { RouteService } from '../../core/services/route.service';
import { RouteStopService } from '../../core/services/route-stop.service';

interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: string;
  color: string;
}

interface RouteWithStops {
  route: Route;
  stops: RouteStop[];
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  stats: StatCard[] = [];
  isLoading = false;
  errorMessage = '';

  // Map
  private map: L.Map | null = null;
  routesWithStops: RouteWithStops[] = [];
  private markers: L.Marker[] = [];
  private polylines: L.Polyline[] = [];
  selectedRouteIndex: number | null = null;

  // Colors for routes
  private routeColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
  ];

  constructor(
    private routeService: RouteService,
    private routeStopService: RouteStopService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRoutesData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 1000);
  }

  loadStats(): void {
    this.stats = [
      { title: 'Toplam Şirket', value: 12, change: 8, icon: 'building', color: 'blue' },
      { title: 'Aktif Sürücü', value: 48, change: 12, icon: 'user', color: 'green' },
      { title: 'Otobüs Sayısı', value: 35, change: 5, icon: 'bus', color: 'purple' },
      { title: 'Aktif Rota', value: 24, change: -3, icon: 'route', color: 'orange' },
      { title: 'Toplam Durak', value: 156, change: 15, icon: 'map-pin', color: 'pink' },
      { title: 'Günlük Sefer', value: 89, change: 22, icon: 'calendar', color: 'indigo' },
    ];
  }

  loadRoutesData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.routeService.getAll().subscribe({
      next: (routesResponse) => {
        if (routesResponse.isSuccess && routesResponse.data) {
          this.routeStopService.getAll().subscribe({
            next: (stopsResponse) => {
              if (stopsResponse.isSuccess && stopsResponse.data) {
                this.matchRoutesWithStops(routesResponse.data, stopsResponse.data);
                this.isLoading = false;
                this.cdr.detectChanges();

                // Harita zaten varsa rota çiz
                if (this.map && this.routesWithStops.length > 0) {
                  this.drawAllRoutes();
                }
              } else {
                this.errorMessage = 'Duraklar yüklenemedi';
                this.isLoading = false;
                this.cdr.detectChanges();
              }
            },
            error: () => {
              this.errorMessage = 'Duraklar yüklenirken hata oluştu';
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.errorMessage = 'Rotalar yüklenemedi';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.errorMessage = 'Rotalar yüklenirken hata oluştu';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  matchRoutesWithStops(routes: Route[], allStops: RouteStop[]): void {
    this.routesWithStops = routes.map((route, index) => {
      const routeStops = allStops
        .filter(stop => stop.routeId === route.id)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

      return {
        route: route,
        stops: routeStops,
        color: this.routeColors[index % this.routeColors.length]
      };
    }).filter(rws => rws.stops.length > 1);
  }

  initMap(): void {
    const mapElement = document.getElementById('dashboard-map');
    
    if (!mapElement) {
      console.error('Map element not found!');
      return;
    }

    console.log('Initializing map...');

    this.map = L.map('dashboard-map', {
      center: [41.0082, 28.9784],
      zoom: 11
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    console.log('Map initialized');

    // Rotalar varsa çiz
    if (this.routesWithStops.length > 0) {
      this.drawAllRoutes();
    }
  }

  drawAllRoutes(): void {
    if (!this.map) return;

    this.clearMap();

    let allBounds: L.LatLngBounds | null = null;

    this.routesWithStops.forEach((rws) => {
      const { route, stops, color } = rws;

      if (stops.length < 2) return;

      // Polyline çiz
      const latLngs: L.LatLngExpression[] = stops.map(s => [s.latitude, s.longitude]);
      
      const polyline = L.polyline(latLngs, {
        color: color,
        weight: 5,
        opacity: 0.8
      }).addTo(this.map!);

      polyline.bindPopup(`
        <div style="font-family: sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: ${color}; font-size: 16px;">${route.name}</h3>
          <p style="margin: 0; font-size: 13px;">
            <strong>Başlangıç:</strong> ${route.startPoint}<br>
            <strong>Bitiş:</strong> ${route.endPoint}<br>
            <strong>Duraklar:</strong> ${stops.length}
          </p>
        </div>
      `);

      this.polylines.push(polyline);

      // Marker'lar
      stops.forEach((stop, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === stops.length - 1;

        let markerColor = color;
        let markerSize = 32;
        let markerText = stop.sequenceNumber.toString();

        if (isFirst) {
          markerColor = '#10B981';
          markerSize = 40;
          markerText = '🚌';
        } else if (isLast) {
          markerColor = '#EF4444';
          markerSize = 40;
          markerText = '🏁';
        }

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background: ${markerColor};
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: ${isFirst || isLast ? '18px' : '14px'};
            ">${markerText}</div>
          `,
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize/2, markerSize/2]
        });

        const marker = L.marker([stop.latitude, stop.longitude], { icon }).addTo(this.map!);

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 220px;">
            <h4 style="margin: 0 0 8px 0; color: ${markerColor}; font-size: 15px;">
              ${stop.sequenceNumber}. Durak ${isFirst ? '(Başlangıç)' : isLast ? '(Bitiş)' : ''}
            </h4>
            <p style="margin: 0 0 8px 0; font-size: 12px;">
              <strong>Rota:</strong> ${route.name}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 12px;">
              <strong>Adres:</strong> ${stop.address}<br>
              <strong>İlçe:</strong> ${stop.district}, ${stop.city}
            </p>
            <p style="margin: 0; font-size: 12px;">
              <strong>🌅 Sabah:</strong> ${stop.estimatedArrivalTimeMorning || '-'}<br>
              <strong>🌆 Akşam:</strong> ${stop.estimatedArrivalTimeEvening || '-'}
            </p>
          </div>
        `);

        this.markers.push(marker);
      });

      // Bounds
      if (!allBounds) {
        allBounds = L.latLngBounds(latLngs);
      } else {
        allBounds.extend(L.latLngBounds(latLngs));
      }
    });

    // Zoom
    if (allBounds && this.map) {
      this.map.fitBounds(allBounds, { padding: [50, 50] });
    }
  }

  clearMap(): void {
    this.markers.forEach(m => this.map?.removeLayer(m));
    this.polylines.forEach(p => this.map?.removeLayer(p));
    this.markers = [];
    this.polylines = [];
  }

  toggleRoute(index: number): void {
    if (this.selectedRouteIndex === index) {
      this.selectedRouteIndex = null;
      this.drawAllRoutes();
    } else {
      this.selectedRouteIndex = index;
      this.drawSingleRoute(index);
    }
  }

  drawSingleRoute(index: number): void {
    if (!this.map) return;

    this.clearMap();

    const rws = this.routesWithStops[index];
    const { route, stops, color } = rws;

    if (stops.length < 2) return;

    const latLngs: L.LatLngExpression[] = stops.map(s => [s.latitude, s.longitude]);
    
    const polyline = L.polyline(latLngs, {
      color: color,
      weight: 7,
      opacity: 0.9
    }).addTo(this.map);

    this.polylines.push(polyline);

    stops.forEach((stop, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === stops.length - 1;

      let markerColor = color;
      let markerSize = 44;
      let markerText = stop.sequenceNumber.toString();

      if (isFirst) {
        markerColor = '#10B981';
        markerSize = 52;
        markerText = '🚌';
      } else if (isLast) {
        markerColor = '#EF4444';
        markerSize = 52;
        markerText = '🏁';
      }

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background: ${markerColor};
            width: ${markerSize}px;
            height: ${markerSize}px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${isFirst || isLast ? '22px' : '18px'};
          ">${markerText}</div>
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize/2, markerSize/2]
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon }).addTo(this.map!);

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 240px;">
          <h4 style="margin: 0 0 8px 0; color: ${markerColor}; font-size: 16px;">
            ${stop.sequenceNumber}. Durak ${isFirst ? '(Başlangıç)' : isLast ? '(Bitiş)' : ''}
          </h4>
          <p style="margin: 0 0 8px 0; font-size: 13px;">
            <strong>Rota:</strong> ${route.name}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 13px;">
            <strong>Adres:</strong> ${stop.address}<br>
            <strong>İlçe:</strong> ${stop.district}, ${stop.city}
          </p>
          <p style="margin: 0; font-size: 13px;">
            <strong>🌅 Sabah:</strong> ${stop.estimatedArrivalTimeMorning || '-'}<br>
            <strong>🌆 Akşam:</strong> ${stop.estimatedArrivalTimeEvening || '-'}
          </p>
        </div>
      `);

      this.markers.push(marker);
    });

    const bounds = L.latLngBounds(latLngs);
    this.map.fitBounds(bounds, { padding: [80, 80] });
  }
getTotalStops(): number {
  return this.routesWithStops.reduce((total, rws) => total + rws.stops.length, 0);
}
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}