import { Routes } from '@angular/router';
import { ConfigurationComponent } from './manage/configuration.component';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';

export default [
    {
        path: 'manage',
        component: ConfigurationComponent,
        data: {
            permissions:[APP_PERMISSIONS.ADMIN_CONFIG_ROOM_CLEAN_PLANIFICATION]
        },
    },
] as Routes;
