export interface Trip {
  id: string;
  appUserId: string;
  routeId: string;
  routeStopId: string;
  isMorningTripActive: boolean;
  isEveningTripActive: boolean;
  validFrom: string | Date;
  validUntil: string | Date;
  appUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  route?: {
    id: string;
    name: string;
    startPoint: string;
    endPoint: string;
  };
  routeStop?: {
    id: string;
    sequenceNumber: number;
    address: string;
    city: string;
    district: string;
  };
  createdDate?: string | Date;
  lastUpdatedDate?: string | Date;
}



export interface CreateTripDto {
  appUserId: string;
  routeId: string;
  routeStopId: string;
  isMorningTripActive: boolean;
  isEveningTripActive: boolean;
  validFrom: string;
  validUntil: string;
}

export interface UpdateTripDto {
  id: string;
  appUserId: string;
  routeId: string;
  routeStopId: string;
  isMorningTripActive: boolean;
  isEveningTripActive: boolean;
  validFrom: string;
  validUntil: string;
}