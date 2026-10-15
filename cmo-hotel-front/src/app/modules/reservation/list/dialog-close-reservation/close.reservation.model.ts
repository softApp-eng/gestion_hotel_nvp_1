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
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { ApiReservationService } from '../../api.reservation.service';
import { ApiCommonService } from '../../../../core/service/api.common.service';
import { UtilsService } from '../../../../core/service/utils.service';
import { NgFor, NgIf } from '@angular/common';

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
        MatSelectModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        NgIf,
        NgFor,
    ],
})
export class CloseReservationModel implements OnInit {
    code;
    date;
    time;
    form: UntypedFormGroup;
    paymentModes = [];

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _utilsService: UtilsService,
        public matDialogRef: MatDialogRef<CloseReservationModel>,
        private _apiReservationService: ApiReservationService,
        private _apiCommonService: ApiCommonService,
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
            paymentMode: ['', [Validators.required]],
            priseEnChargeReference: [''],
        });

        // La référence n'est obligatoire que lorsque le mode de règlement
        // est "Prise en charge".
        this.form.get('paymentMode').valueChanges.subscribe((mode) => {
            const ref = this.form.get('priseEnChargeReference');
            if (mode === 'PRISE_EN_CHARGE') {
                ref.setValidators([Validators.required]);
            } else {
                ref.clearValidators();
            }
            ref.updateValueAndValidity();
        });

        this.loadPaymentModes();
        this.loadReservation();
    }

    loadPaymentModes(): void {
        this._apiCommonService.getEnumsData('payment-mode').subscribe((data) => {
            this.paymentModes = data ?? [];
        });
    }

    /**
     * Pré-remplit le mode de règlement avec la valeur actuelle de la
     * réservation afin de permettre de la modifier.
     */
    loadReservation(): void {
        this._apiReservationService.getReservation(this.code).subscribe({
            next: (res) => {
                const isPEC = res?.priseEnCharge === true;
                this.form.patchValue({
                    paymentMode: isPEC ? 'PRISE_EN_CHARGE' : 'ESPECE',
                    priseEnChargeReference: res?.priseEnChargeReference ?? '',
                });
            },
            error: () => {
                if (!this.form.get('paymentMode').value) {
                    this.form.patchValue({ paymentMode: 'ESPECE' });
                }
            },
        });
    }

    save(): void {
        if (this.form.invalid) return;

        const rawDate = this.form.get('date').value;
        const rawTime = this.form.get('time').value;
        const paymentMode = this.form.get('paymentMode').value;
        const priseEnChargeReference = this.form.get(
            'priseEnChargeReference'
        ).value;

        const formattedDateTime = this._utilsService.convertToLocalDateTime(
            rawDate,
            rawTime
        );

        this._apiReservationService
            .closeReservation(
                this.code,
                formattedDateTime,
                paymentMode,
                paymentMode === 'PRISE_EN_CHARGE'
                    ? priseEnChargeReference
                    : null
            )
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
