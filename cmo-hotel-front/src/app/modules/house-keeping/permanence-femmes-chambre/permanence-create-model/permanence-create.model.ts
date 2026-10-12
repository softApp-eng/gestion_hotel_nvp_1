import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ApiHousekeepingService } from '../../api.housekeeping.service';

export interface PermanenceDialogData {
    agents: any[];
    date: Date;
    /** Permanence existante (mode modification) */
    permanence?: any;
}

@Component({
    selector: 'permanence-create',
    templateUrl: './permanence-create.model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
    ],
})
export class PermanenceCreateModel implements OnInit {
    isEdit = false;
    saving = false;

    agents: any[] = [];
    agentId: any = '';
    date: Date = new Date();

    constructor(
        public matDialogRef: MatDialogRef<PermanenceCreateModel>,
        private _apiHousekeepingService: ApiHousekeepingService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA) public data: PermanenceDialogData
    ) {
        this.agents = data?.agents || [];
        this.date = data?.date ? new Date(data.date) : new Date();
    }

    ngOnInit(): void {
        const p = this.data?.permanence;
        if (p) {
            this.isEdit = true;
            this.agentId = p.agent?.id ?? '';
            this.date = this.parseFrDate(p.date) || this.date;
        }
    }

    private parseFrDate(value: any): Date | null {
        if (!value) {
            return null;
        }
        if (value instanceof Date) {
            return value;
        }
        const m = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) {
            return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        }
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }

    private fmtDate(d: Date): string {
        const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }

    canSave(): boolean {
        return this.agentId !== '' && this.agentId != null && !!this.date;
    }

    save(): void {
        if (!this.canSave() || this.saving) {
            return;
        }
        const payload = { agentId: this.agentId, date: this.fmtDate(this.date) };
        const p = this.data?.permanence;

        this.saving = true;
        const req$ = p?.id
            ? this._apiHousekeepingService.updatePermanence(p.id, payload)
            : this._apiHousekeepingService.createPermanence(payload);

        req$.pipe(finalize(() => (this.saving = false))).subscribe({
            next: () => {
                this._toast.success(p?.id ? 'Permanence mise à jour' : 'Permanence enregistrée');
                this.matDialogRef.close(true);
            },
            error: (err) => {
                this._toast.error(err?.error?.message || "Impossible d'enregistrer la permanence");
            },
        });
    }

    cancel(): void {
        this.matDialogRef.close(false);
    }
}
