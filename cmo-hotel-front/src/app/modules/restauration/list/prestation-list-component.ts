import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatDrawerContainer, MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
 import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CommonModule, DecimalPipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { ApiRestaurationService } from '../api.restauration.service';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { RouterLink } from '@angular/router';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { PrestationMonoCreateModel } from '../create-one-prestation-model/prestation-mono-create.model';
import { PrestationEditModel } from '../edit-prestation-model/prestation-edit.model';
import { ExtractGuestDataPipe } from '../../reservation/list/extract-guest-data-pipe';
import { ReservationDetailsModel } from '../../reservation/dialog-reservation-details/reservation.details.model';
import { ApiReservationService } from '../../reservation/api.reservation.service';

@Component({
    selector: 'app-restauration-list',
    templateUrl: './prestation-list-component.html',
    imports: [
        MatPaginator,
        MatIcon,
        DecimalPipe,
        MatDrawer,
        MatDrawerContainer,
        MatTable,
        MatSidenavModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatPaginatorModule,
        MatSortModule,
        RouterLink,
        DisableIfNoPermissionDirective,
        MatFormField,
        MatInput,
        MatPrefix,
        MatTooltip,
        NgClass,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
        CommonModule,
        HighlightPipe,
    ],
    standalone: true,
})
export class PrestationListComponent implements OnInit {
    @ViewChild('matDrawer') matDrawer: MatDrawer;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    displayedColumns: string[] = [
        'reservationCode',
        'category',
        'client',
        'identity',
        'totalPrice',
        'action',
    ];
    dataSource = new MatTableDataSource<any>([]);
    selectedItem: any;

    pageSize = 20;
    pageSizeOptions = [20, 50, 100];
    totalRows = 0;
    currentPage = 0;
    drawerMode: MatDrawerMode;

    prestations = [];
    key = '';

    rowSpans: Map<string, number> = new Map();

    constructor(
        private apiService: ApiRestaurationService,
        private _apiReservationService: ApiReservationService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.loadPrestations();
    }

    loadPrestations() {
        this.apiService.getPrestationsForResidents().subscribe({
            next: (res) => {
                let sortedData = res;
                sortedData?.sort((a, b) => {
                    // On accède à la profondeur details -> code
                    const codeA = a.details?.code || 0;
                    const codeB = b.details?.code || 0;

                    if (codeB !== codeA) {
                        return codeB - codeA;
                    }

                    // 2. Deuxième critère (si codes égaux) : role.order (DESC)
                    const orderA = a.role?.order || 0;
                    const orderB = b.role?.order || 0;

                    return orderA - orderB;
                });

                this.prestations = sortedData;
                this.dataSource.data = sortedData;

                this.totalRows = sortedData.length;


                if (this.paginator) {
                    this.dataSource.paginator = this.paginator;
                }
            },
            error: (err) => console.error(err),
        });
    }

    search(key: string): void {
        this.key = key?.trim().toLowerCase();

        if (!this.key) {
            this.dataSource.data = this.prestations;
            return; // Stop ici si vide
        }

        this.dataSource.data = this.prestations?.filter((item) => {
            const person = item?.person;
            const details = item?.details;
            const role = item?.role;

            const searchString = [
                person?.identity,
                person?.firstName,
                person?.lastName,
                person?.grade?.code,
                person?.grade?.name,
                details?.code?.toString(),
                role?.name
            ].join(' ').toLowerCase();

            return searchString.includes(this.key);
        });
    }

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

    openDrawer(item: any) {
        this.selectedItem = item;
        this.matDrawer.open();
    }

    closeDrawer() {
        this.matDrawer.close();
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
    }

    raiseEditPrestation(row: any) {
        this._matDialog
            .open(PrestationEditModel, {
                data: { reservation: row },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((data) => {
                if (data?.reload) {
                    this.loadPrestations();
                }
            });
    }

    raiseSaveOnePrestation(row) {
        this._matDialog
            .open(PrestationMonoCreateModel, {
                data: { reservation: row.reservationId },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((data) => {
                if (data?.reload) {
                    this.loadPrestations();
                }
            });
    }

    raiseReservationDetailsDialog(code) {
        this._apiReservationService.getReservation(code).subscribe({
            next: (data) => {
                this._matDialog
                    .open(ReservationDetailsModel, {
                        data: { reservation: data},
                        disableClose: true,
                    })
                    .afterClosed()
                    .subscribe();
            }
        })
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
