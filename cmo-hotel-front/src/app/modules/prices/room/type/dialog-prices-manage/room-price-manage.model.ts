import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
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
import { ApiRoomTypeService } from '../api.room-type.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiRoomPriceService } from '../api.room-price.service';
import { MatMenu } from '@angular/material/menu';
import { RoomPriceCreateModel } from '../dialog-create-price/room-price-create.model';
import { MatTooltip } from '@angular/material/tooltip';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../../../@fuse/services/confirmation';

@Component({
    selector: 'room-type-create-model',
    templateUrl: './room-price-manage.model.html',
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
        MatSortModule,
        MatTableModule,
        MatTooltip,
    ],
})
export class RoomPriceManageModel implements OnInit, AfterViewInit {
    isLoading: boolean = false;
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

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<RoomPriceManageModel>,
        private _apiRoomPriceService: ApiRoomPriceService,
        private _toast: ToastrService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA)
        public data: { type: any }
    ) {
        this.loadPrices(data.type.id);
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {}

    loadPrices(typeId) {
        this.isLoading = true;
        this._apiRoomPriceService
            .findByType(typeId)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.dataSource.data = value;
                    this.dataSource.sort = this.sort;
                },
            });
    }

    raisePriceCreate(price?) {
        this._matDialog
            .open(RoomPriceCreateModel, {
                data: { type: this.data.type, price: price },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res?.reload) {
                    this.loadPrices(this.data.type.id);
                }
            });
    }

    deletePrice(price) {
        this.actionConfigDialogue.title = `Confirmer la suppression du prix "${price.category} (${price.price})".`
        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer le prix "${price.category} (${price.price})" ?<br> Cette action est irréversible.`
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this._apiRoomPriceService
                    .delete(price.id)
                    .subscribe({
                        next: (value) => {
                            this._toast.success('Prix supprimé');
                            this.dataSource.data = this.dataSource.data.filter(s => s.id !== price.id);
                        },
                        error: (err) =>
                            this._toast.error(
                                err?.error?.description || "Une erreur s'est produit"
                            ),
                    });
        });
    }
}
