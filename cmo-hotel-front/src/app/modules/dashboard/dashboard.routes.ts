import { Routes } from '@angular/router';
import { DashboardComponent } from 'app/modules/dashboard/dashboard.component';
import { inject } from '@angular/core';
import { FinanceComponent } from './finance/finance.component';
import { FinanceService } from './finance/finance.service';
import { DashboardFinanceComponent } from './finance-revenue/dashboard.finance.component';

export default [
    {
        path     : '',
        component: DashboardComponent,
    },{
        path     : 'finance/total',
        component: DashboardFinanceComponent,
    },
    {
        path: 'finance/statistics',
        component: FinanceComponent,
        resolve: {
            data: () => inject(FinanceService).getData(),
        },
    },
] as Routes;
