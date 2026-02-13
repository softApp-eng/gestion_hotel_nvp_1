import {
    AfterViewInit,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../../../@fuse/services/confirmation';
import { Toastr } from '../../../../../core/service/toastr.service';
import { FormsModule } from '@angular/forms';
import { ApiRoomTypeService } from '../api.room-type.service';
import { SlicePipe } from '@angular/common';
import { RoomTypeCreateModel } from '../dialog-create-type/room-type-create.model';
import { RoomPriceManageModel } from '../dialog-prices-manage/room-price-manage.model';
import { APP_PERMISSIONS } from '../../../../../core/data/app-permissions';
import { DisableIfNoPermissionDirective } from '../../../../../core/auth/DisableIfNoPermissionDirective';

@Component({
    selector: 'prices-room-types-list',
    templateUrl: './room-types.list.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        MatSidenavModule,
        MatIconModule,
        FormsModule,
        MatTabsModule,
        MatSortModule,
        SlicePipe,
        DisableIfNoPermissionDirective,
    ],
})
export class RoomTypesListComponent implements OnInit, AfterViewInit {
    isLoading: boolean = false;
    displayedColumns: string[] = ['type', 'description', 'prices', 'action'];
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

    /**
     * Constructor
     */
    constructor(
        private _apiRoomTypeService: ApiRoomTypeService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
        private _matDialog: MatDialog
    ) {}

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        this.loadTypes();
    }

    loadTypes() {
        this.isLoading = true;
        this._apiRoomTypeService
            .all()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.dataSource.data = value;
                    this.dataSource.sort = this.sort;
                    console.log(value);
                },
            });
    }

    raiseSaveType(type?) {
        this._matDialog
            .open(RoomTypeCreateModel, {
                data: { type: type },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((data) => {
                if (data?.reload) {
                    this.loadTypes();
                }
            });
    }

    raisePricesManagement(type?) {
        this._matDialog
            .open(RoomPriceManageModel, {
                data: { type: type },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((data) => {
                //if (data?.reload) {
                this.loadTypes();
                //}
            });
    }

    deleteType(type) {
        this.actionConfigDialogue.title = `Confirmer la suppression du type "${type.type}".`;
        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer le type "${type.type}" ?<br> Cette action est irréversible. Toutes les chambres ayant ce type seront dissociée`;
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this._apiRoomTypeService.delete(type.id).subscribe({
                    next: (value) => {
                        this._toast.success('Type supprimé');
                        this.dataSource.data = this.dataSource.data.filter(
                            (s) => s.id !== type.id
                        );
                    },
                    error: (err) =>
                        this._toast.error(
                            err?.error?.description ||
                                "Une erreur s'est produit"
                        ),
                });
        });
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
