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
import { ApiReservationService } from '../../reservation/api.reservation.service';
import { Toastr } from '../../../core/service/toastr.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'time-extend',
    templateUrl: './time-extend.model.html',
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
        DatePipe,
    ],
})
export class TimeExtendModel implements OnInit {
    title = 'Prolonger le séjour';
    loading = false;
    extendForm: FormGroup;
    minDate: Date = new Date();

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<TimeExtendModel>,
        private _fb: FormBuilder,
        private _apiReservationService: ApiReservationService,
        private _utilsService: UtilsService,
        private _toast: Toastr,
        @Inject(MAT_DIALOG_DATA) public data: { reservation: any }
    ) {
        this.extendForm = this._fb.group({
            newDate: [null, [Validators.required]],
        });
    }

    ngOnInit(): void {}

    save(): void {
        if (this.extendForm.invalid) return;

        this.loading = true;
        const selectedDate = this.extendForm.get('newDate').value;

        this._apiReservationService
            .extendReservation(this.data.reservation.code, this._utilsService.convertToDate(selectedDate))
            .subscribe({
                next: () => {
                    this._toast.success(
                        "Le séjour a été prolongé avec succès jusqu'au " +
                            new Intl.DateTimeFormat('fr-FR').format(
                                selectedDate
                            )
                    );
                    this.matDialogRef.close({ reload: true });
                },
                error: (err) => {
                    const errorMsg =
                        err?.error?.message ||
                        err?.error?.description ||
                        'Impossible de traiter la prolongation';
                    this._toast.error(errorMsg);
                    this.loading = false;
                },
            });
    }
}
