import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder, UntypedFormGroup, Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { ApiReservationService } from '../../api.reservation.service';
import { UtilsService } from '../../../../core/service/utils.service';
import { DatePipe, NgIf } from '@angular/common';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatChip, MatChipListbox } from '@angular/material/chips';
import { MatRipple } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'switch-room',
    templateUrl: './switch.room.model.html',
    styleUrls: ['./switch.room.model.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatTableModule,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        NgIf,
        MatStepper,
        MatStep,
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatCardSubtitle,
        MatCardContent,
        DatePipe,
        MatChipListbox,
        MatChip,
        FormsModule,
        MatRipple,
    ],
})
export class SwitchRoomModel implements OnInit {
    step = 0;
    reservation: any;
    displayedColumns: string[] = ['previous', 'new', 'pavillon', 'reason'];
    selectedGuest: any;

    code;
    date;
    time;
    form: UntypedFormGroup;

     // Charger votre JSON ici

    newRoom: any;
    changeReason: string = '';

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _utilsService: UtilsService,
        public matDialogRef: MatDialogRef<SwitchRoomModel>,
        private _apiReservationService: ApiReservationService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { reservation: any }
    ) {
        this.reservation = data.reservation;
        console.log('passed res', this.reservation);
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            reservationId: [this.code, [Validators.required]],
            newRoomId: ['', [Validators.required]],
            date: [null, [Validators.required]],
            time: ['12:00', [Validators.required]],
            reason: [''],
        });
    }

    stepTo(step: number) {
        this.step += step;
    }

    save(): void {
        if (this.form.invalid) return;

        const rawDate = this.form.get('date').value;
        const rawTime = this.form.get('time').value;

        const formattedDateTime = this._utilsService.convertToLocalDateTime(
            rawDate,
            rawTime
        );

        this._apiReservationService
            .closeReservation(this.code, formattedDateTime)
            .subscribe({
                next: () => {
                    this._toast.success('Réservation cloturée');
                    this.matDialogRef.close({ reload: true });
                },
                error: (err) => {
                    this._toast.error(
                        err?.error?.description ||
                            'Erreur lors de la validation'
                    );
                },
            });
    }

    selectGuest(guest: any) {
        this.selectedGuest = guest;
    }

    openRoomPicker() {
        // Appel de votre modal déjà développée
        /*const dialogRef = this.dialog.open(RoomPickerModalComponent, {
            data: { pavillonId: this.selectedGuest.room.pavillon.id }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.newRoom = result; // La chambre choisie dans votre modal
            }
        });*/
    }

    confirmChange() {
        const payload = {
            guestId: this.selectedGuest.id,
            oldRoomId: this.selectedGuest.room.id,
            newRoomId: this.newRoom.id,
            reason: this.changeReason,
            timestamp: new Date(),
        };
        console.log('Transfert prêt :', payload);
        // Appeler votre service de mise à jour ici
    }
}
