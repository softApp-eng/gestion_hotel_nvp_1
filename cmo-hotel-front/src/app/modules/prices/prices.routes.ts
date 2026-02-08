import { Routes } from '@angular/router';
import { APP_MODULES } from '../../core/data/app-modules';

export default [
    {
        path: 'room',
        loadChildren: () => import('./room/room-prices.routes'),
        data: {
            module:[APP_MODULES.ROOM]
        },
    },
] as Routes;
