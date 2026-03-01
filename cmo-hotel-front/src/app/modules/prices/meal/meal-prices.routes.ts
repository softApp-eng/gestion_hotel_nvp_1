import { Routes } from '@angular/router';
import { MealTypesListComponent } from './type/list/meal-types.list.component';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';



export default [
    {
        path: 'types',
        component: MealTypesListComponent,
        data: {
            permissions:[APP_PERMISSIONS.MEAL_TYPES_LIST]
        },
    }
] as Routes;
