import { Routes } from '@angular/router';
import { InvoiceListComponent } from './list/invoice.list.component';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { EncaissementComponent } from './encaissement/encaissement.component';

export default [
    {
        path     : 'search',
        component: InvoiceListComponent,
        data: {
            permissions:[APP_PERMISSIONS.INVOICE_LIST]
        },
    },{
        path     : 'encaissement',
        component: EncaissementComponent,
        data: {
            permissions:[APP_PERMISSIONS.INVOICE_ENCAISSEMENT]
        },
    }
] as Routes;
