import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    FormBuilder, FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { ApiInvoiceService } from '../api.invoice.service';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UtilsService } from '../../../core/service/utils.service';
import { MatRadioModule } from '@angular/material/radio';
import { DecimalPipe, NgClass, NgIf } from '@angular/common';
import { ApiCommonService } from '../../../core/service/api.common.service';

@Component({
    selector: 'payment-model',
    templateUrl: './payment.model.html',
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
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        NgClass,
        DecimalPipe,
        NgIf,
    ],
})
export class PaymentModel implements OnInit {
    title = 'Effectuer un paiement';
    paymentForm: FormGroup;
    loading = false;
    invoice;
    paymentModes = [];

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<PaymentModel>,
        private _fb: FormBuilder,
        private _apiInvoiceService: ApiInvoiceService,
        private _apiCommonService: ApiCommonService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA) public data: { invoice: any[] }
    ) {
        this.invoice = data.invoice;
        console.log(this.invoice);
        this.paymentForm = this._fb.group({
            num: [this.invoice.num, [Validators.required]],
            paymentMode: ['', [Validators.required]],
            priseEnChargeRef: [''],
            observation: [''],
        });
    }

    ngOnInit(): void {
        this.loadPaymentMode();
    }

    loadPaymentMode() {
        this._apiCommonService.getEnumsData('payment-mode').subscribe(data => {
            const isPEC = this.invoice.reservationDetails.priseEnCharge;
            // Filtrage des modes de paiement
            this.paymentModes = data?.filter(m =>
                isPEC ? m.code === 'PRISE_EN_CHARGE' : m.code !== 'PRISE_EN_CHARGE'
            );
            if (isPEC) {
                this.paymentForm.patchValue({
                    priseEnChargeRef: this.invoice.reservationDetails.priseEnChargeReference
                });
            }
        });
    }

    validate(): void {
        if (this.paymentForm.invalid) return;

        this.loading = true;

        this._apiInvoiceService.payInvoice(this.paymentForm.value).subscribe({
            next: (res) => {
                this._toast.success('Facture payée avec succès');
                this.matDialogRef.close({ reload: true });
            },
            error: (err) => {
                this._toast.error(
                    err?.error?.description || 'Erreur lors du paiement'
                );
                this.loading = false;
            },
        });
    }
}
