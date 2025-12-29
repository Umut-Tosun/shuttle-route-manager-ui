export interface Bus {
  id: string;
  plateNo: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  km: number;
  companyId: string;
  defaultDriverId?: string | null;
  company?: {
    id: string;
    name: string;
  };
  defaultDriver?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  routes?: {
    id: string;
    name: string;
    startPoint: string;
    endPoint: string;
    driver: {
      id: string;
      firstName: string;
      lastName: string;
      fullName: string;
    };
  }[];
  createdDate?: string | Date;
  lastUpdatedDate?: string | Date;
}

export interface CreateBusDto {
  plateNo: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  km: number;
  companyId: string;
  defaultDriverId?: string | null;
}

export interface UpdateBusDto {
  id: string;
  plateNo: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  km: number;
  companyId: string;
  defaultDriverId?: string | null;
}