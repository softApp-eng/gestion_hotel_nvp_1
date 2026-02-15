import { Routes } from '@angular/router';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { PlanningCalenderComponent } from './calender/planning.calender.component';

export default [
    {
        path     : '',
        component: PlanningCalenderComponent,
        data: {
            //permissions:[APP_PERMISSIONS.RESERVATION_LIST]
        },
    },
] as Routes;
