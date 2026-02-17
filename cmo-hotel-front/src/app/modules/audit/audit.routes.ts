import { Routes } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { AuditListComponent } from './list/audit.list.component';

export default [
    {
        path     : 'logs',
        component: AuditListComponent,
        data: {
            permissions:[APP_PERMISSIONS.ADMIN_AUDIT_ACTIVITY_LOGS]
        },
    }
] as Routes;
