import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'prestation-delete',
    templateUrl: './prestation-delete.model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatToolbarModule,
        FormsModule,
    ],
})
export class PrestationDeleteModel {
    reason = '';

    constructor(
        public matDialogRef: MatDialogRef<PrestationDeleteModel>,
        @Inject(MAT_DIALOG_DATA) public data: { name?: string }
    ) {}

    cancel(): void {
        this.matDialogRef.close(null);
    }

    confirm(): void {
        const reason = (this.reason || '').trim();
        if (!reason) {
            return;
        }
        this.matDialogRef.close(reason);
    }
}
