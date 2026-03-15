import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    FormBuilder, FormGroup,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { ApiInvoiceService } from '../../invoice/api.invoice.service';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UtilsService } from '../../../core/service/utils.service';

@Component({
    selector: 'night-validation',
    templateUrl: './night-validation.model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatSelectModule,
        MatDatepicker,
        MatDatepickerModule,
        MatProgressSpinnerModule,
    ],
})
export class NightValidationModel implements OnInit {
    title = 'Validation de la Nuitée';
    nightForm: FormGroup;
    loading = false;
    maxDate = new Date();
    totalPersons = 0;
    totalRooms = 0;

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<NightValidationModel>,
        private _fb: FormBuilder,
        private _apiInvoiceService: ApiInvoiceService,
        private _utilsService: UtilsService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA) public data: { reservations: any[] }
    ) {
        this.totalPersons = data.reservations.reduce((acc, res) => acc + res.guests.length, 0);

        this.totalRooms = new Set(data.reservations.flatMap(res => res.guests.map(g => g.room.id))).size;

        this.nightForm = this._fb.group({
            nightDate: [new Date(), [Validators.required]],
            observation: [''],
            reservationCode: [
                this.data.reservations?.map((r) => r.code) || [],
            ],
        });
    }

    ngOnInit(): void {
        if (!this.data.reservations || this.data.reservations.length === 0) {
            this._toast.warning(
                'Attention : Aucune réservation active pour cette sélection.'
            );
        }
    }

    validate(): void {
        if (this.nightForm.invalid) return;

        this.loading = true;
        const payload = {
            nightDate: this._utilsService.convertToDate(this.nightForm.value.nightDate),
            reservationCode: [...new Set(this.nightForm.value.reservationCode)], // Éviter les doublons de codes
        };

        this._apiInvoiceService.validateInvoiceNight(payload).subscribe({
            next: (res) => {
                this._toast.success('La nuitée a été validée avec succès');
                this.matDialogRef.close(true);
            },
            error: (err) => {
                this._toast.error(err?.error?.description || 'Erreur lors de la validation');
                this.loading = false;
            },
        });
    }
}
