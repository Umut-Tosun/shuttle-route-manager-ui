export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  licenseNumber: string;
  jobStartDate: string | Date;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
  createdDate?: string | Date;
  lastUpdatedDate?: string | Date;
}

export interface CreateDriverDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  licenseNumber: string;
  jobStartDate: string;
  companyId: string;
}

export interface UpdateDriverDto {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  licenseNumber: string;
  jobStartDate: string;
  companyId: string;
}