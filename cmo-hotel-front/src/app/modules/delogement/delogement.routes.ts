import { Routes } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { DelogementListComponent } from './list/delogement.list.component';

export default [
    {
        path: '',
        component: DelogementListComponent,
        data: {
            permissions: [APP_PERMISSIONS.RESERVATION_LIST],
        },
    },
] as Routes;
