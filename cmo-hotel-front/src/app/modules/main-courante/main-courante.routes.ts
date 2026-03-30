import { Routes } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { MainCouranteListComponent } from './main-courante.list.component';

export default [
    {
        path     : 'list',
        component: MainCouranteListComponent,
        data: {
            permissions:[APP_PERMISSIONS.RESERVATION_MAIN_COURANTE]
        },
    },
] as Routes;
