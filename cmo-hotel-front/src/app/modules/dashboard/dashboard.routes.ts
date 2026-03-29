import { Routes } from '@angular/router';
import { DashboardComponent } from 'app/modules/dashboard/dashboard.component';
import { inject } from '@angular/core';
import { FinanceComponent } from './finance/finance.component';
import { DashboardFinanceComponent } from './finance-revenue/dashboard.finance.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AnalyticsService } from './analytics/analytics.service';

export default [
    {
        path     : 'home',
        component: DashboardComponent,
    },{
        path     : 'finance/total',
        component: DashboardFinanceComponent,
    },
    {
        path: 'finance/statistics',
        component: FinanceComponent,
    },
    {
        path: 'reservations/analytics',
        component: AnalyticsComponent,
        resolve: {
            data: () => inject(AnalyticsService).getData(),
        },
    },
] as Routes;
