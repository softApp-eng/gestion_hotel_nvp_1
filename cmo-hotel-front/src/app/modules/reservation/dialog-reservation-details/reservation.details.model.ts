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
import { ApiReservationService } from '../api.reservation.service';

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
        private _apiReservationService:ApiReservationService,
        public matDialogRef: MatDialogRef<ReservationDetailsModel>,
        @Inject(MAT_DIALOG_DATA)
        public data: { reservation: any }
    ) {
        this.reservation = data.reservation;
        console.log(this.reservation);
    }

    ngOnInit(): void {}

    downloadInvoice() {
        this._apiReservationService.downloadInvoice(this.reservation.code).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Facture_${this.reservation.code}.pdf`;
            link.click();
        });
    }
}
