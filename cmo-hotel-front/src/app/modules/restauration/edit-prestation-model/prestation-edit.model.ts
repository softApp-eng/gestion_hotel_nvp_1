import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { ApiMealTypeService } from '../../prices/meal/type/api.meal-type.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ApiRestaurationService } from '../api.restauration.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { Toastr } from '../../../core/service/toastr.service';
import { PrestationMonoCreateModel } from '../create-one-prestation-model/prestation-mono-create.model';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';

@Component({
    selector: 'prestation-edit',
    templateUrl: './prestation-edit.model.html',
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
        MatButtonToggleModule,
        FormsModule,
        DecimalPipe,
        DatePipe,
        MatTooltip,
        DisableIfNoPermissionDirective,
    ],
})
export class PrestationEditModel implements OnInit {
    title = 'Prestations';
    resrvation;
    actionConfigDialogue: FuseConfirmationConfig = {
        title: '',
        message: '',
        icon: {
            show: true,
            name: 'heroicons_outline:exclamation-triangle',
            color: 'warn',
        },
        actions: {
            confirm: {
                show: true,
                label: 'Confirmer',
                color: 'warn',
            },
            cancel: {
                show: true,
                label: 'Annuler',
            },
        },
        dismissible: true,
    };

    /**
     * Constructor
     */
    constructor(
        private _matDialog: MatDialog,
        public matDialogRef: MatDialogRef<PrestationEditModel>,
        public _apiRestaurationService: ApiRestaurationService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
        @Inject(MAT_DIALOG_DATA)
        public data: { reservation: any }
    ) {
        this.resrvation = data.reservation;
        console.log('resrvation id', this.resrvation);
    }

    ngOnInit(): void {}

    totalAmount(p): number {
        if (!p || !p.prestations) {
            return 0;
        }
        return p.prestations.reduce((acc, p) => {
            return acc + p.price * p.quantity;
        }, 0);
    }

    totalQuantities(p): number {
        if (!p || !p.prestations) {
            return 0;
        }

        return p.prestations.reduce((acc, p) => {
            return acc + (p.quantity || 0);
        }, 0);
    }

    raiseSaveOnePrestation(row) {
        this._matDialog
            .open(PrestationMonoCreateModel, {
                data: {
                    reservation: this.resrvation.reservationId,
                    prestation: row,
                },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result?.reload && result?.update && result?.data) {
                    const newData = result.data;
                    const index = this.resrvation.prestations.findIndex(
                        (p) => p.prestationId === newData.prestationId
                    );

                    if (index !== -1) {
                        this.resrvation.prestations[index] = {
                            ...this.resrvation.prestations[index],
                            ...newData,
                        };

                        this.resrvation.prestations = [
                            ...this.resrvation.prestations,
                        ];
                    }
                }
            });
    }

    deletePrestation(p: any): void {
        this.actionConfigDialogue.title = `Confirmer la suppression de la prestation`;
        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer cette prestation de? <br> Cette action est irréversible.`;
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._apiRestaurationService
                    .deletePrestation(p.prestationId)
                    .subscribe({
                        next: () => {
                            this._toast.success(
                                'Prestation supprimée avec succès'
                            );
                            this.resrvation.prestations =
                                this.resrvation?.prestations?.filter(
                                    (pr) => pr.prestationId !== p.prestationId
                                );
                        },
                        error: (err) =>
                            this._toast.error(
                                err?.error?.description ||
                                    "Une erreur s'est produite"
                            ),
                    });
            }
        });
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
