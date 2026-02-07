import { Routes } from '@angular/router';
import { PersonListComponent } from './list/person.list.component';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { PersonCreateComponent } from './create/person.create.component';

export default [
    {
        path     : '',
        component: PersonListComponent,
        data: {
            permissions:[APP_PERMISSIONS.PERSON_LIST]
        },
    },
    {
        path     : 'create',
        component: PersonCreateComponent,
        data: {
            permissions:[APP_PERMISSIONS.PERSON_CREATE]
        },
    },
    {
        path     : 'edit/:personId',
        component: PersonCreateComponent,
        data: {
            permissions:[APP_PERMISSIONS.PERSON_UPDATE]
        },
    }
] as Routes;
