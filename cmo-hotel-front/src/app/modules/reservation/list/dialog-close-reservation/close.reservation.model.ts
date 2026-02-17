import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    ReactiveFormsModule,
    UntypedFormBuilder, UntypedFormGroup, Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { ApiReservationService } from '../../api.reservation.service';
import { UtilsService } from '../../../../core/service/utils.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'close-reservation',
    templateUrl: './close.reservation.model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        NgIf,
    ],
})
export class CloseReservationModel implements OnInit {
    code;
    date;
    time;
    form: UntypedFormGroup;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _utilsService: UtilsService,
        public matDialogRef: MatDialogRef<CloseReservationModel>,
        private _apiReservationService: ApiReservationService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { code: any }
    ) {
        this.code = data.code;
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            date: [null, [Validators.required]],
            time: ['12:00', [Validators.required]],
        });
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
}
