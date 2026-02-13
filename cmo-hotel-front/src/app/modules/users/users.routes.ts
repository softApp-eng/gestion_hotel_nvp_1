import { Routes } from '@angular/router';
import { UserListComponent } from './list/user.list.component';
import { UserAddComponent } from './add/user.add.component';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';

export default [
    {
        path     : '',
        component: UserListComponent,
        data: {
            permissions:[APP_PERMISSIONS.ADMIN_USERS_LIST]
        },
    },{
        path     : 'create',
        component: UserAddComponent,
        data: {
            permissions:[APP_PERMISSIONS.ADMIN_USERS_CREATE]
        },
    }
] as Routes;
