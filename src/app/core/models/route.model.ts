export interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  morningStartTime: string; // TimeSpan format: "08:00:00"
  eveningStartTime: string; // TimeSpan format: "17:00:00"
  busId: string;
  driverId: string;
  bus?: {
    id: string;
    plateNo: string;
    brand: string;
    model: string;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  routeStops?: RouteStop[];
  createdDate?: string | Date;
  lastUpdatedDate?: string | Date;
}

export interface RouteStop {
  id: string;
  sequenceNumber: number;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedArrivalTimeMorning: string; // TimeSpan format
  estimatedArrivalTimeEvening: string; // TimeSpan format
  routeId: string;
}

export interface CreateRouteDto {
  name: string;
  startPoint: string;
  endPoint: string;
  morningStartTime: string;
  eveningStartTime: string;
  busId: string;
  driverId: string;
}

export interface UpdateRouteDto {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  morningStartTime: string;
  eveningStartTime: string;
  busId: string;
  driverId: string;
}