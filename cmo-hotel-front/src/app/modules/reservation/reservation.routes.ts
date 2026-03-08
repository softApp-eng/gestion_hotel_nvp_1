import { Routes } from '@angular/router';
import { ReservationListComponent } from './list/reservation.list.component';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { ReservationCreateComponent } from './create/reservation.create.component';

export default [
    {
        path     : '',
        component: ReservationListComponent,
        data: {
            permissions:[APP_PERMISSIONS.RESERVATION_LIST]
        },
    },
    {
        path     : 'create',
        component: ReservationCreateComponent,
        data: {
            permissions:[APP_PERMISSIONS.RESERVATION_CREATE]
        },
    },{
        path     : 'edit/:code',
        component: ReservationCreateComponent,
        data: {
            permissions:[APP_PERMISSIONS.RESERVATION_UPDATE]
        },
    }
] as Routes;
