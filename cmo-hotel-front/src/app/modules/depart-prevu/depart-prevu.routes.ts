import { Routes } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { DepartPrevuListComponent } from './depart-prevu.list.component';

export default [
    {
        path: 'list',
        component: DepartPrevuListComponent,
        data: {
            permissions: [APP_PERMISSIONS.RESERVATION_MAIN_COURANTE],
        },
    },
] as Routes;
