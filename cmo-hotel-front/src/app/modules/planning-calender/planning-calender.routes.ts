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
    {
        // Planning des chambres : même vue que le planning d'occupation,
        // mais éditable (glisser-déposer entre chambres + redimensionnement des dates).
        path     : 'rooms',
        component: PlanningCalenderComponent,
        data: {
            editable: true,
            title: 'Planning des chambres',
            subtitle:
                "Glissez une réservation vers une autre chambre pour la déloger, ou étirez son bord droit pour prolonger le séjour. Chaque modification est confirmée puis enregistrée.",
        },
    },
] as Routes;
