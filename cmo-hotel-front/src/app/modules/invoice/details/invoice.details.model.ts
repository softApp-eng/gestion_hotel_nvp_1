import {
    Component,
    Inject,
    OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DatePipe, DecimalPipe, NgClass, NgStyle } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { ApiRestaurationService } from '../../restauration/api.restauration.service';
import { ApiInvoiceService } from '../api.invoice.service';

@Component({
    selector: 'invoice-details-model',
    templateUrl: './invoice.details.model.html',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
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

    /**
     * Constructor
     */
    constructor(
        private _apiRestaurationService: ApiRestaurationService,
        private _apiInvoiceService: ApiInvoiceService,
        public matDialogRef: MatDialogRef<InvoiceDetailsModel>,
        @Inject(MAT_DIALOG_DATA)
        public data: { invoice: any }
    ) {
        this.invoice = data.invoice;
    }

    ngOnInit(): void {}

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
