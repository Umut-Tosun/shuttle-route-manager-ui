export interface RouteStop {
  id: string;
  sequenceNumber: number;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedArrivalTimeMorning: string; // TimeSpan format: "08:00:00"
  estimatedArrivalTimeEvening: string; // TimeSpan format: "17:00:00"
  routeId: string;
  route?: {
    id: string;
    name: string;
    startPoint: string;
    endPoint: string;
  };
  createdDate?: string | Date;
  lastUpdatedDate?: string | Date;
}

export interface CreateRouteStopDto {
  sequenceNumber: number;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedArrivalTimeMorning: string;
  estimatedArrivalTimeEvening: string;
  routeId: string;
}

export interface UpdateRouteStopDto {
  id: string;
  sequenceNumber: number;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedArrivalTimeMorning: string;
  estimatedArrivalTimeEvening: string;
  routeId: string;
}