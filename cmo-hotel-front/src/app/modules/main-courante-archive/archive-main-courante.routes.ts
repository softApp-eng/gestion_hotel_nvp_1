import { Routes } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { ArchiveMainCouranteListComponent } from './archive-main-courante.list.component';

export default [
    {
        path: 'list',
        component: ArchiveMainCouranteListComponent,
        data: {
            permissions: [APP_PERMISSIONS.RESERVATION_MAIN_COURANTE],
        },
    },
] as Routes;
