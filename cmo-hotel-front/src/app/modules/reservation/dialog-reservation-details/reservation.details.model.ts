import {
    Component,
    Inject,
    OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgClass, NgStyle } from '@angular/common';

@Component({
    selector: 'reservation-details-model',
    templateUrl: './reservation.details.model.html',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        NgStyle,
        NgClass,
    ],
})
export class ReservationDetailsModel implements OnInit {
    reservation;

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<ReservationDetailsModel>,
        @Inject(MAT_DIALOG_DATA)
        public data: { reservation: any }
    ) {
        this.reservation = data.reservation;
    }

    ngOnInit(): void {}
}
