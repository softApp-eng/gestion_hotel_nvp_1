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
import { Toastr } from '../../../core/service/toastr.service';
import { PrestationMonoCreateModel } from '../create-one-prestation-model/prestation-mono-create.model';
import { PrestationDeleteModel } from '../delete-prestation-model/prestation-delete.model';
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

    /**
     * Constructor
     */
    constructor(
        private _matDialog: MatDialog,
        public matDialogRef: MatDialogRef<PrestationEditModel>,
        public _apiRestaurationService: ApiRestaurationService,
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
                    category:
                        this.resrvation?.person?.grade?.category ??
                        row?.person?.grade?.category,
                    beneficiary: this.resrvation?.person ?? row?.person,
                    room: this.resrvation?.room ?? row?.room,
                    code:
                        this.resrvation?.details?.code ??
                        this.resrvation?.code ??
                        row?.details?.code,
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
        // Demander le motif de suppression avant de supprimer
        this._matDialog
            .open(PrestationDeleteModel, {
                data: { name: p?.name },
                width: '460px',
                maxWidth: '95vw',
                disableClose: true,
            })
            .afterClosed()
            .subscribe((reason) => {
                // null => action annulée
                if (reason === null || reason === undefined) {
                    return;
                }
                this._apiRestaurationService
                    .deletePrestation(p.prestationId, reason)
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
            });
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
