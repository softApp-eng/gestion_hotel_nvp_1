import { Routes } from '@angular/router';
import { RoomTypesListComponent } from './type/list/room-types.list.component';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';

export default [
    {
        path     : 'types',
        component: RoomTypesListComponent,
        data: {
            permissions:[APP_PERMISSIONS.ROOM_TYPE_LIST]
        },
    }
] as Routes;
