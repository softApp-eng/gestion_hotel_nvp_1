import {
    AfterViewInit,
    Component,
    Inject,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef
} from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import {
    FuseConfirmationConfig,
    FuseConfirmationService
} from '@fuse/services/confirmation';
import { ToastrService } from 'ngx-toastr';

import { ApiMealPriceService } from '../api.meal-price.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MealPriceCreateDialogComponent } from '../dialog-create-price/meal-create-price.model';
import { RoomPriceCreateModel } from '../../../room/type/dialog-create-price/room-price-create.model';
import { APP_PERMISSIONS } from '../../../../../core/data/app-permissions';
import { DisableIfNoPermissionDirective } from '../../../../../core/auth/DisableIfNoPermissionDirective';

@Component({
    selector: 'meal-price-manage-model',
    templateUrl: './meal-price-manage.model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSortModule,
        MatTableModule,
        MatTooltip,
        MatToolbar,
        DisableIfNoPermissionDirective,
    ],
})
export class MealPriceManageModel implements OnInit, AfterViewInit {
    isLoading = false;
    displayedColumns: string[] = ['category', 'price', 'action'];
    dataSource = new MatTableDataSource<any>([]);

    @ViewChild(MatSort) sort: MatSort;

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

    constructor(
        public matDialogRef: MatDialogRef<MealPriceManageModel>,
        private _apiMealPriceService: ApiMealPriceService,
        private _toast: ToastrService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: { type: any }
    ) {
        this.loadPrices(data.type.id);
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {}

    // ================= LOAD =================

    loadPrices(typeId: number) {
        this.isLoading = true;
        this._apiMealPriceService
            .findByType(typeId)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (value: any[]) => {
                    this.dataSource.data = value;
                    this.dataSource.sort = this.sort;
                },
            });
    }

    // ================= CREATE / EDIT =================

    raisePriceCreate(price?) {
        this._matDialog
            .open(MealPriceCreateDialogComponent, {
                data: { type: this.data.type, price },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res?.reload) {
                    this.loadPrices(this.data.type.id);
                }
            });
    }

    // ================= DELETE =================

    deletePrice(price: any) {
        this.isLoading = true;

        this.actionConfigDialogue.title = `Confirmer la suppression du prix "${price.category} (${price.price})".`;

        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer le prix
            "<b>${price.category} (${price.price})</b>" ?<br>
            Cette action est irréversible.`;

        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._apiMealPriceService.delete(price.id).subscribe({
                    next: () => {
                        this._toast.success('Prix supprimé');
                        this.dataSource.data = this.dataSource.data.filter(
                            (p) => p.id !== price.id
                        );
                    },
                    error: (err) =>
                        this._toast.error(
                            err?.error?.message || "Une erreur s'est produite"
                        ),
                });
            }
        });
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
