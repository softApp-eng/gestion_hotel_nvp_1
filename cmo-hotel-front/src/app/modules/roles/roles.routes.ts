import { Routes } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { RoleCreateComponent } from './create/role.create.component';
import { RoleListComponent } from './list/role.list.component';

export default [
    {
        path     : '',
        component: RoleListComponent,
        data: {
            permissions:[APP_PERMISSIONS.ADMIN_ROLES_LIST]
        },
    },
    {
        path     : 'create',
        component: RoleCreateComponent,
        data: {
            permissions:[APP_PERMISSIONS.ADMIN_ROLES_CREATE]
        },
    },{
        path     : 'edit/:roleId',
        component: RoleCreateComponent,
        data: {
            permissions:[APP_PERMISSIONS.ADMIN_ROLES_UPDATE]
        },
    }
] as Routes;
