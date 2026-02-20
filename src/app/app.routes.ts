import { Routes } from '@angular/router';
import { Login } from './feature/user/pages/login/login';
import { User } from './feature/user/components/user/user';

import { ShellComponent } from './feature/shell/shell.component';
import { DashboardComponent } from './feature/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
    },
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'app',
        component: ShellComponent,
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent,
            },
            {
                path: 'clients',
                loadComponent: () => import('./feature/clients/clients.component').then(m => m.ClientsComponent),
            },
            {
                path: 'meters',
                loadComponent: () => import('./feature/meters/meters.component').then(m => m.MetersComponent),
            },
            {
                path: 'readings',
                loadComponent: () => import('./feature/readings/readings.component').then(m => m.ReadingsComponent),
            },
            {
                path: 'invoices',
                loadComponent: () => import('./feature/invoices/invoices.component').then(m => m.InvoicesComponent),
            },
            {
                path: 'reports',
                loadComponent: () => import('./feature/reports/reports.component').then(m => m.ReportsComponent),
            },
                {
                    path: 'despesas',
                    loadComponent: () => import('./feature/expenses/expenses.component').then(m => m.ExpensesComponent),
                },
                {
                    path: 'relatorio-financeiro',
                    loadComponent: () => import('./feature/financial-report/financial-report.component').then(m => m.FinancialReportComponent),
                },
            {
                path: 'settings',
                loadComponent: () => import('./feature/settings/settings.component').then(m => m.SettingsComponent),
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'dashboard',
            },
        ],
    },
    {
        path: 'user',
        component: User,
    },
];
