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
        public matDialogRef: MatDialogRef<InvoiceDetailsModel>,
        @Inject(MAT_DIALOG_DATA)
        public data: { invoice: any }
    ) {
        this.invoice = data.invoice;
        console.log(this.invoice);
    }

    ngOnInit(): void {}

    downloadInvoice() {}
}
