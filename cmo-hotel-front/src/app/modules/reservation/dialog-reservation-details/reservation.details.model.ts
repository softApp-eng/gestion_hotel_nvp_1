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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { ApiRestaurationService } from '../../restauration/api.restauration.service';

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
        MatButtonToggleModule,
        FormsModule,
    ],
})
export class ReservationDetailsModel implements OnInit {
    reservation;
    prestations;
    mode: 'HEBERGEMENT'|'PRESTATION' = 'HEBERGEMENT';
    prestationsSummary = [];


    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _apiRestaurationService: ApiRestaurationService,
        public matDialogRef: MatDialogRef<ReservationDetailsModel>,
        @Inject(MAT_DIALOG_DATA)
        public data: { reservation: any }
    ) {
        this.reservation = data.reservation;
        this.loadPrestations(data.reservation.code);
        console.log(this.reservation);
    }

    ngOnInit(): void {}

    downloadInvoice() {
        this._apiReservationService
            .downloadInvoice(this.reservation.code)
            .subscribe((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Facture_${this.reservation.code}.pdf`;
                link.click();
            });
    }

    loadPrestations(code){
        this._apiRestaurationService.getPrestationsForReservation(code).subscribe({
            next: (res: any) => {
                this.prestations = res;
                res?.forEach(guest => {
                    if (guest.prestations && guest.prestations.length > 0) {
                        guest.prestations.forEach(p => {
                            this.prestationsSummary.push({
                                beneficiaire: `${guest.person.firstName} ${guest.person.lastName}`,
                                grade: guest.person.grade.code,
                                label: p.name,
                                type: p.type,
                                date: p.day,
                                quantite: p.quantity,
                                prixUnitaire: p.price,
                                total: p.price * p.quantity,
                                observation: p.observation
                            });
                        });
                    }
                });
            }
        })
    }

    changeMode(m: any) {
        this.mode = m;
    }

    calculateTotal(): number {
        return this.prestationsSummary.reduce((acc, curr) => acc + (curr.prixUnitaire * curr.quantite), 0) || 0;
    }

    calculateTotalByType(type): number {
        return this.prestationsSummary
            .filter(p => p.type === type)
            .reduce((acc, curr) => acc + (curr.prixUnitaire * curr.quantite), 0) || 0;
    }
}
