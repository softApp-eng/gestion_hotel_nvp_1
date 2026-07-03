import { Routes } from '@angular/router';
import { PavillonListComponent } from './list/pavillon.list.component';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { RoomListComponent } from './room/list/room.list.component';
import { RoomCreateComponent } from './room/create/room.create.component';

export default [
    {
        path     : '',
        component: PavillonListComponent,
        data: {
            permissions:[APP_PERMISSIONS.PAVILLON_LIST]
        },
    },{
        path     : ':pavillonId/rooms',
        component: RoomListComponent,
        data: {
            permissions:[
                APP_PERMISSIONS.ROOM_LIST
            ]
        },
    },{
        path     : ':pavillonId/rooms/create',
        component: RoomCreateComponent,
        data: {
            permissions:[APP_PERMISSIONS.ROOM_CREATE]
        },
    },{
        path     : ':pavillonId/rooms/edit/:roomId',
        component: RoomCreateComponent,
        data: {
            permissions:[APP_PERMISSIONS.ROOM_UPDATE]
        },
    }
] as Routes;
