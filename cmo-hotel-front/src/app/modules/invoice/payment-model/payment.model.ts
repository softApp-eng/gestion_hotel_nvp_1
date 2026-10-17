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
    changeModeOnly = false;

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<PaymentModel>,
        private _fb: FormBuilder,
        private _apiInvoiceService: ApiInvoiceService,
        private _apiCommonService: ApiCommonService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA) public data: { invoice: any; changeModeOnly?: boolean }
    ) {
        this.invoice = data.invoice;
        this.changeModeOnly = !!data?.changeModeOnly;
        if (this.changeModeOnly) {
            this.title = 'Modifier le mode de paiement';
        }
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
            if (this.changeModeOnly) {
                // Changement libre après check-out : tous les modes sont proposés
                this.paymentModes = data || [];
            } else {
                // Filtrage des modes de paiement
                this.paymentModes = data?.filter(m =>
                    isPEC ? m.code === 'PRISE_EN_CHARGE' : m.code !== 'PRISE_EN_CHARGE'
                );
            }

            // Pré-sélection du mode de règlement défini lors du check-out
            const currentMode = this.invoice.paymentMode?.code;
            if (currentMode && this.paymentModes.some(m => m.code === currentMode)) {
                this.paymentForm.patchValue({ paymentMode: currentMode });
            } else if (isPEC) {
                this.paymentForm.patchValue({ paymentMode: 'PRISE_EN_CHARGE' });
            }

            if (isPEC) {
                this.paymentForm.patchValue({
                    priseEnChargeRef: this.invoice.reservationDetails.priseEnChargeReference
                });
            }
        });

        // La référence est obligatoire pour une prise en charge
        this.paymentForm.get('paymentMode').valueChanges.subscribe(mode => {
            const ref = this.paymentForm.get('priseEnChargeRef');
            if (mode === 'PRISE_EN_CHARGE') {
                ref.setValidators([Validators.required]);
            } else {
                ref.clearValidators();
            }
            ref.updateValueAndValidity();
        });
    }

    validate(): void {
        if (this.paymentForm.invalid) return;

        this.loading = true;

        if (this.changeModeOnly) {
            this._apiInvoiceService.changePaymentMode(this.paymentForm.value).subscribe({
                next: () => {
                    this._toast.success('Mode de paiement modifié avec succès');
                    this.matDialogRef.close({ reload: true });
                },
                error: (err) => {
                    this._toast.error(
                        err?.error?.description || 'Erreur lors de la modification'
                    );
                    this.loading = false;
                },
            });
            return;
        }

        // Pré-ouverture d'un onglet : le contenu (le PDF) est injecté dans le
        // callback asynchrone. Cela évite que le navigateur bloque la popup.
        const invoiceTab = window.open('', '_blank');

        this._apiInvoiceService.payInvoice(this.paymentForm.value).subscribe({
            next: (res) => {
                this._toast.success('Facture payée avec succès');
                // Affichage automatique de la facture dans un nouvel onglet
                this.openInvoiceInNewTab(
                    res?.num || this.invoice?.num,
                    invoiceTab
                );
                this.matDialogRef.close({ reload: true });
            },
            error: (err) => {
                invoiceTab?.close();
                this._toast.error(
                    err?.error?.description || 'Erreur lors du paiement'
                );
                this.loading = false;
            },
        });
    }

    /**
     * Ouvre le PDF de la facture dans un nouvel onglet (sans le télécharger).
     *
     * @param num numéro interne de la facture
     * @param tab onglet pré-ouvert (null si le navigateur l'a bloqué)
     */
    private openInvoiceInNewTab(num: string, tab: Window | null): void {
        if (!num) {
            tab?.close();
            return;
        }

        this._apiInvoiceService.generateInvoicePdf(num).subscribe({
            next: (blob: Blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                if (tab) {
                    tab.location.href = blobUrl;
                    tab.focus();
                } else {
                    // Repli si l'onglet n'a pas pu être pré-ouvert
                    window.open(blobUrl, '_blank');
                }
                // Nettoyage différé pour laisser le temps au nouvel onglet de charger
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
            },
            error: () => tab?.close(),
        });
    }
}
