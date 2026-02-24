import { Route } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { HousekeepingAgentsComponent } from './agent/housekeeping-agents.component';
import { HousekeepingListComponent } from './housekeeping/list/housekeeping.list.component';
import { HousekeepingHistoryComponent } from './history/housekeeping.history.component';

export default [
    {
        path     : 'agents',
        component: HousekeepingAgentsComponent,
        data: {
            permissions:[APP_PERMISSIONS.HOUSE_KEEPING_AGENT_LIST]
        },
    },
    {
        path     : 'manage',
        component: HousekeepingListComponent,
        data: {
            permissions:[APP_PERMISSIONS.ROOM_GRANTED]
        },
    },{
        path     : 'history',
        component: HousekeepingHistoryComponent,
        data: {
            permissions:[APP_PERMISSIONS.HOUSE_KEEPING_HISTORY_SEARCH]
        },
    },
] as Route[];
