// company.model.ts
export interface Company {
  id: string;
  name: string;
  address: string;
  responsiblePerson: string;
  responsiblePersonPhoneNumber: string;
  taxOffice: string;
  taxNumber: string;
  contractDate: string | Date;  // Her iki tipi de kabul et
  contractEndDate: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateCompanyDto {
  name: string;
  address: string;
  responsiblePerson: string;
  responsiblePersonPhoneNumber: string;
  taxOffice: string;
  taxNumber: string;
  contractDate: string;  // ISO string formatında
  contractEndDate: string;
}

export interface UpdateCompanyDto {
  id: string;
  name: string;
  address: string;
  responsiblePerson: string;
  responsiblePersonPhoneNumber: string;
  taxOffice: string;
  taxNumber: string;
  contractDate: string;  // ISO string formatında
  contractEndDate: string;
}