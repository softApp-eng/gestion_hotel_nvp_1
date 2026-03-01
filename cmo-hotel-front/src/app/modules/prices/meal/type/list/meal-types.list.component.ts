import {
    AfterViewInit,
    Component,
    OnInit,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { finalize } from 'rxjs';

import { ApiMealTypeService } from '../api.meal-type.service';
import { MealTypeSaveDialogComponent } from '../dialog-create-type/meal-create-type.model';
import { MealPriceManageModel } from '../dialog-prices-manage/meal-price-manage.model';

import {
    FuseConfirmationService,
    FuseConfirmationConfig
} from '@fuse/services/confirmation';

import { ToastrService } from 'ngx-toastr';
import { APP_PERMISSIONS } from '../../../../../core/data/app-permissions';
import { DisableIfNoPermissionDirective } from '../../../../../core/auth/DisableIfNoPermissionDirective';

@Component({
    selector: 'app-meal-types-list',
    standalone: true,
    templateUrl: './meal-types.list.component.html',
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatDialogModule,
        MatSortModule,
        DisableIfNoPermissionDirective,
    ],
})
export class MealTypesListComponent implements OnInit, AfterViewInit {
    isLoading = false;
    displayedColumns = ['name', 'description', 'prices', 'action'];

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
                label: 'Supprimer',
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
        private api: ApiMealTypeService,
        private dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: ToastrService
    ) {}
    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }
    ngOnInit(): void {
        this.load();
    }

    // ================= LOAD =================

    load(): void {
        this.isLoading = true;
        this.api
            .allWithPrices()
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (res) => {
                    this.dataSource.data = res.map((r) => ({
                        ...r,
                        showAllPrices: false,
                    }));
                    this.dataSource.sort = this.sort;
                },
            });
    }

    // ================= ACTIONS =================

    raiseSaveType(row?: any) {
        this.dialog
            .open(MealTypeSaveDialogComponent, {
                width: '450px',
                data: row || null,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result === true) {
                    this.load();
                }
            });
    }

    raisePricesManagement(type: any) {
        this.dialog
            .open(MealPriceManageModel, {
                data: { type },
                width: '700px',
                disableClose: true,
            })
            .afterClosed()
            .subscribe((data) => {
                //if (data?.reload) {
                this.load();
                // }
            });
    }

    // ================= DELETE =================

    deleteType(row: any) {
        this.actionConfigDialogue.title = `Confirmer la suppression du type "${row.mealType}"`;

        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer le type
            <b>${row.mealType}</b> ?<br>
            Cette action est <b>irréversible</b>.`;

        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.api.delete(row.id).subscribe({
                    next: () => {
                        this._toast.success('Type de repas supprimé');
                        this.dataSource.data = this.dataSource.data.filter(
                            (t) => t.id !== row.id
                        );
                    },
                    error: (err) => {
                        this._toast.error(
                            err?.error?.message ||
                                'Erreur lors de la suppression'
                        );
                    },
                });
            }
        });
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
