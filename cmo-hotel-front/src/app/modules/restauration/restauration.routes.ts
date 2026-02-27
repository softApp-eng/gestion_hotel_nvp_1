import { Routes } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { ReservationCreateComponent } from '../reservation/create/reservation.create.component';
import { PrestationCreateComponent } from './create/prestation-create-component';
import { PrestationListComponent } from './list/prestation-list-component';

export default [
    {
        path     : '',
        component: PrestationListComponent,
        /*data: {
            permissions:[APP_PERMISSIONS.RESERVATION_LIST]
        },*/
    },
    {
        path     : 'create',
        component: PrestationCreateComponent,
        /*data: {
            permissions:[APP_PERMISSIONS.RESERVATION_CREATE]
        },*/
    },
] as Routes;
