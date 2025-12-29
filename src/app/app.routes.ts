import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'companies',
        loadComponent: () => import('./features/companies/companies').then(m => m.CompaniesComponent)
      },
      {
        path: 'drivers',
        loadComponent: () => import('./features/drivers/drivers').then(m => m.DriversComponent)
      },
      {
        path: 'buses',
        loadComponent: () => import('./features/buses/buses').then(m => m.BusesComponent)
      }
    ]
  }
];