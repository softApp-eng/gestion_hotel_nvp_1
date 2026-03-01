import { Routes } from '@angular/router';
import { PrestationCreateComponent } from './create/prestation-create-component';
import { PrestationListComponent } from './list/prestation-list-component';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';

export default [
    {
        path     : '',
        component: PrestationListComponent,
        data: {
            permissions:[APP_PERMISSIONS.PRESTATION_FOR_RESIDENTS]
        },
    },
    {
        path     : 'create',
        component: PrestationCreateComponent,
        data: {
            permissions:[APP_PERMISSIONS.PRESTATION_CREATE]
        },
    },
] as Routes;
