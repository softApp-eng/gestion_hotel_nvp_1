import { Component, Inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

/* -------------------------------------------------------------------------- */
/*                      Correction d'une nuitée facturée                      */
/* -------------------------------------------------------------------------- */

@Component({
    selector: 'night-correction-dialog',
    standalone: true,
    imports: [
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
    ],
    template: `
        <h2 mat-dialog-title class="flex items-center gap-2">
            <mat-icon class="icon-size-5 text-primary" svgIcon="heroicons_outline:pencil-square"></mat-icon>
            Corriger la nuitée
        </h2>

        <mat-dialog-content class="!pt-2 sm:w-96">
            <div class="mb-4 rounded-lg bg-primary-50 dark:bg-primary-500/10 px-4 py-3 text-sm">
                <div class="font-semibold text-slate-800 dark:text-white">Nuitée du {{ nightDate }}</div>
                <div class="text-secondary mt-0.5">Chambre {{ roomName }}</div>
            </div>

            <mat-form-field class="w-full">
                <mat-label>Prix appliqué (MAD)</mat-label>
                <input matInput type="number" min="0" step="0.01" [(ngModel)]="price">
            </mat-form-field>

            <mat-form-field class="w-full">
                <mat-label>Observation</mat-label>
                <textarea matInput rows="3" [(ngModel)]="observation" placeholder="Motif de la correction, précisions..."></textarea>
            </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Annuler</button>
            <button mat-flat-button color="primary" [disabled]="saving" (click)="save()">
                Enregistrer
            </button>
        </mat-dialog-actions>
    `,
})
export class NightCorrectionDialog implements OnInit {
    price: number | null = null;
    observation = '';
    saving = false;

    constructor(
        public matDialogRef: MatDialogRef<NightCorrectionDialog>,
        @Inject(MAT_DIALOG_DATA) public data: { night: any }
    ) {}

    get nightDate(): string {
        return this.data?.night?.nightDate || '';
    }

    get roomName(): string {
        return this.data?.night?.roomName || this.data?.night?.roomApplied?.name || '—';
    }

    ngOnInit(): void {
        this.price = this.data?.night?.roomPriceApplied ?? null;
        this.observation = this.data?.night?.observation || '';
    }

    save(): void {
        if (this.price === null || this.price === undefined || this.price <= 0) {
            return;
        }
        this.saving = true;
        this.matDialogRef.close({
            price: Number(this.price),
            observation: this.observation,
        });
    }
}

/* -------------------------------------------------------------------------- */
/*                    Correction d'une prestation facturée                    */
/* -------------------------------------------------------------------------- */

@Component({
    selector: 'prestation-correction-dialog',
    standalone: true,
    imports: [
        DecimalPipe,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
    ],
    template: `
        <h2 mat-dialog-title class="flex items-center gap-2">
            <mat-icon class="icon-size-5 text-primary" svgIcon="heroicons_outline:pencil-square"></mat-icon>
            Corriger la prestation
        </h2>

        <mat-dialog-content class="!pt-2 sm:w-96">
            <div class="mb-4 rounded-lg bg-primary-50 dark:bg-primary-500/10 px-4 py-3 text-sm">
                <div class="font-semibold text-slate-800 dark:text-white">{{ prestation?.name || 'Prestation' }}</div>
                <div class="text-secondary mt-0.5">{{ prestation?.type }} — {{ prestation?.guestName || 'Bénéficiaire non renseigné' }}</div>
            </div>

            <mat-form-field class="w-full">
                <mat-label>Libellé</mat-label>
                <input matInput type="text" [(ngModel)]="name">
            </mat-form-field>

            <div class="flex gap-4">
                <mat-form-field class="flex-1">
                    <mat-label>Quantité</mat-label>
                    <input matInput type="number" min="1" step="1" [(ngModel)]="quantity">
                </mat-form-field>

                <mat-form-field class="flex-1">
                    <mat-label>Prix unitaire (MAD)</mat-label>
                    <input matInput type="number" min="0" step="0.01" [(ngModel)]="price">
                </mat-form-field>
            </div>

            <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total ligne : {{ (quantity || 0) * (price || 0) | number: '1.2-2' }} MAD
            </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Annuler</button>
            <button mat-flat-button color="primary" [disabled]="saving" (click)="save()">
                Enregistrer
            </button>
        </mat-dialog-actions>
    `,
})
export class PrestationCorrectionDialog implements OnInit {
    name = '';
    quantity: number | null = null;
    price: number | null = null;
    saving = false;

    constructor(
        public matDialogRef: MatDialogRef<PrestationCorrectionDialog>,
        @Inject(MAT_DIALOG_DATA) public data: { prestation: any }
    ) {}

    get prestation(): any {
        return this.data?.prestation;
    }

    ngOnInit(): void {
        this.name = this.prestation?.name || '';
        this.quantity = this.prestation?.quantity ?? 1;
        this.price = this.prestation?.price ?? null;
    }

    save(): void {
        if (!this.name || this.name.trim() === '') {
            return;
        }
        if (!this.quantity || this.quantity <= 0) {
            return;
        }
        if (this.price === null || this.price === undefined || this.price <= 0) {
            return;
        }
        this.saving = true;
        this.matDialogRef.close({
            name: this.name.trim(),
            quantity: Number(this.quantity),
            price: Number(this.price),
        });
    }
}

/* -------------------------------------------------------------------------- */
/*              Confirmation de suppression (renforcée si facture payée)      */
/* -------------------------------------------------------------------------- */

@Component({
    selector: 'confirm-correction-dialog',
    standalone: true,
    imports: [
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
    ],
    template: `
        <h2 mat-dialog-title class="flex items-center gap-2">
            <mat-icon class="icon-size-5"
                      [class.text-red-600]="forced"
                      [class.text-amber-600]="!forced"
                      [svgIcon]="forced ? 'heroicons_outline:exclamation-triangle' : 'heroicons_outline:question-mark-circle'">
            </mat-icon>
            {{ title }}
        </h2>

        <mat-dialog-content class="!pt-2 sm:w-96">
            <p class="text-sm leading-6 text-slate-700 dark:text-slate-300">{{ message }}</p>

            @if (forced) {
                <div class="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    Cette facture est <strong>déjà réglée</strong>. La correction modifiera les totaux
                    déjà encaissés et sera tracée dans le journal d'audit.
                    <mat-checkbox class="!block mt-3" [(ngModel)]="confirmed">
                        Je confirme la correction de cette facture réglée
                    </mat-checkbox>
                </div>
            }
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Annuler</button>
            <button mat-flat-button
                    [color]="forced ? 'warn' : 'primary'"
                    [disabled]="forced && !confirmed"
                    (click)="matDialogRef.close({ confirm: true })">
                Confirmer
            </button>
        </mat-dialog-actions>
    `,
})
export class ConfirmCorrectionDialog implements OnInit {
    confirmed = false;

    constructor(
        public matDialogRef: MatDialogRef<ConfirmCorrectionDialog>,
        @Inject(MAT_DIALOG_DATA)
        public data: { title: string; message: string; forced?: boolean }
    ) {}

    get title(): string {
        return this.data?.title || 'Confirmer la correction';
    }

    get message(): string {
        return this.data?.message || '';
    }

    /** Facture réglée : confirmation renforcée (case à cocher obligatoire). */
    get forced(): boolean {
        return !!this.data?.forced;
    }

    ngOnInit(): void {}
}
