import {
    Component,
    Inject,
    OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, DecimalPipe, NgClass, NgStyle } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiRestaurationService } from '../../restauration/api.restauration.service';
import { ApiInvoiceService } from '../api.invoice.service';
import { LastValidatedNightService } from '../../../core/service/lastValidatedNight.service';

@Component({
    selector: 'invoice-details-model',
    templateUrl: './invoice.details.model.html',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        NgStyle,
        NgClass,
        MatButtonToggleModule,
        FormsModule,
        DecimalPipe,
        DatePipe,
    ],
})
export class InvoiceDetailsModel implements OnInit {
    invoice;

    /** Indique qu'une nuitée a été validée depuis ce dialogue (pour recharger la liste). */
    changed = false;

    /** Nuitée en cours de validation (au format yyyy-MM-dd). */
    validatingNight: string | null = null;

    /**
     * Constructor
     */
    constructor(
        private _apiRestaurationService: ApiRestaurationService,
        private _apiInvoiceService: ApiInvoiceService,
        private _lastValidatedNightService: LastValidatedNightService,
        private _toast: ToastrService,
        public matDialogRef: MatDialogRef<InvoiceDetailsModel>,
        @Inject(MAT_DIALOG_DATA)
        public data: { invoice: any }
    ) {
        this.invoice = data.invoice;
    }

    ngOnInit(): void {}

    /**
     * Ferme le dialogue en signalant à l'appelant qu'il faut recharger la liste.
     */
    close(): void {
        this.matDialogRef.close({ reload: this.changed });
    }

    /**
     * Valide une nuitée manquante (non facturée) directement depuis la facture.
     * @param day date de la nuitée au format yyyy-MM-dd (issu de invoice.missingNights)
     */
    validateMissingNight(day: string): void {
        const code = this.invoice?.reservationDetails?.code;
        if (!code) {
            this._toast.error('Réservation introuvable pour valider la nuitée');
            return;
        }

        this.validatingNight = day;
        const payload = {
            nightDate: this.toDisplayDate(day),
            reservationCode: [code],
            observation: 'Nuitée validée manuellement depuis la facture',
        };

        this._apiInvoiceService
            .validateInvoiceNight(payload)
            .subscribe({
                next: () => {
                    this._toast.success('La nuitée a été validée avec succès');
                    this.changed = true;
                    this._lastValidatedNightService.updateLastNight();
                    this.reloadInvoice(code);
                },
                error: (err) => {
                    this.validatingNight = null;
                    this._toast.error(
                        err?.error?.description ||
                            err?.error?.message ||
                            'Erreur lors de la validation de la nuitée'
                    );
                },
            });
    }

    /** Recharge la facture affichée pour rafraîchir les nuitées validées / manquantes. */
    private reloadInvoice(code: any): void {
        this._apiInvoiceService.getInvoiceByReservationCode(code).subscribe({
            next: (invoice: any) => {
                if (invoice) {
                    // L'API peut renvoyer une liste ; on garde la facture correspondante.
                    this.invoice = Array.isArray(invoice)
                        ? invoice.find((i) => i.num === this.invoice?.num) || invoice[0]
                        : invoice;
                }
                this.validatingNight = null;
            },
            error: () => {
                this.validatingNight = null;
            },
        });
    }

    /** Convertit une date yyyy-MM-dd en dd/MM/yyyy sans décalage de fuseau horaire. */
    private toDisplayDate(day: string): string {
        const parts = String(day).split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return day;
    }

    /**
     * Ouvre la facture (PDF) dans un nouvel onglet sans la télécharger.
     */
    downloadInvoice() {
        const num = this.invoice?.num;
        if (!num) return;

        // Pré-ouverture de l'onglet pour éviter le blocage des popups
        const tab = window.open('', '_blank');

        this._apiInvoiceService.generateInvoicePdf(num).subscribe({
            next: (blob: Blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                if (tab) {
                    tab.location.href = blobUrl;
                    tab.focus();
                } else {
                    window.open(blobUrl, '_blank');
                }
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
            },
            error: () => tab?.close(),
        });
    }
}
