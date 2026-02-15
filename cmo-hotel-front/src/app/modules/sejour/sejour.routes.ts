import { Routes } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { SejourListComponent } from './list/sejour.list.component';

export default [
    {
        path     : '',
        component: SejourListComponent,
        data: {
            permissions:[APP_PERMISSIONS.RESERVATION_LIST]
        },
    },
] as Routes;
