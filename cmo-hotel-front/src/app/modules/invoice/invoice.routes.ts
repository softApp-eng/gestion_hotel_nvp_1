import { Routes } from '@angular/router';
import { InvoiceListComponent } from './list/invoice.list.component';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';

export default [
    {
        path     : '',
        component: InvoiceListComponent,
        data: {
            permissions:[APP_PERMISSIONS.INVOICE_LIST]
        },
    }
] as Routes;
