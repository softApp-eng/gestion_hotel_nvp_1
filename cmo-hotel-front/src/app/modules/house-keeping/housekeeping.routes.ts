import { Route } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { HousekeepingAgentsComponent } from './agent/housekeeping-agents.component';

export default [
    {
        path     : 'agents',
        component: HousekeepingAgentsComponent,
        data: {
            permissions:[APP_PERMISSIONS.HOUSE_KEEPING_AGENT_LIST]
        },
    },
    /*{
        path: '',
        children: [
            { path: '', pathMatch: 'full', component: HousekeepingComponent },     // /managements/housekeeping
            { path: 'agents', component: HousekeepingAgentsComponent },            // /managements/housekeeping/agents
            { path: 'anomalies', component: HousekeepingAnomaliesComponent },      // /managements/housekeeping/Anomalies
        ],
    },*/
] as Route[];
