import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HighlightPipe } from '../../../../../@fuse/pipes/HighlightPipe';
import { APP_PERMISSIONS } from '../../../../core/data/app-permissions';
import { DisableIfNoPermissionDirective } from '../../../../core/auth/DisableIfNoPermissionDirective';
import { DatePipe, NgClass } from '@angular/common';
import { ApiRoomService } from '../../../pavillon/api.room.service';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../../@fuse/services/confirmation';
import { Toastr } from '../../../../core/service/toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiHousekeepingService } from '../../api.housekeeping.service';
import { AgentCreateModel } from '../../agent/dialog-create-agent/agent-create.model';
import { RoomUpdateCleanStatusModel } from '../dialog-update-room-status/room-update-clean-status.model';
import { FormsModule } from '@angular/forms';
import {
    MatDatepickerToggle,
    MatDateRangeInput,
    MatDateRangePicker,
    MatEndDate,
    MatStartDate,
} from '@angular/material/datepicker';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
    selector: 'housekeeping-room-list',
    templateUrl: './housekeeping.list.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        HighlightPipe,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        MatPaginator,
        MatSortModule,
        NgClass,
        FormsModule,

    ],
})
export class HousekeepingListComponent implements OnInit, AfterViewInit {
    rooms;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'name',
        'type',
        'floor',
        'status',
        'etat',
        'dispo',
        'action',
    ];
    dataSource = new MatTableDataSource<any>([]);
    key = '';

    @ViewChild('paginator') _paginator: MatPaginator;
    totalRows = 0;
    currentPage = 0;
    pavillon;
    counts = {
        propre: 0,
        sale: 0,
        occupe: 0,
        horsService: 0,
    }

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
        private _apiRoomService: ApiRoomService,
        private _apiHousekeepingService: ApiHousekeepingService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
        private _matDialog: MatDialog
    ) {}

    ngAfterViewInit(): void {
        this.dataSource.paginator = this._paginator;
    }

    ngOnInit(): void {
        this.loadRooms();
    }

    loadRooms() {
        this.isLoading = true;
        this._apiRoomService
            .grantedRooms()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.dataSource.data = this.rooms = value;
                    this.dataSource.paginator = this._paginator;
                    this.counts = this.rooms.reduce((acc, room) => {
                        if (room.clean) {
                            acc.propre++;
                        } else {
                            acc.sale++;
                        }
                        if (room.reserved) {
                            acc.occupe++;
                        }
                        if (!room.available) {
                            acc.horsService++;
                        }

                        return acc;
                    }, {
                        propre: 0,
                        sale: 0,
                        occupe: 0,
                        horsService: 0
                    });
                },
            });
    }

    search(key: string) {
        this.key = key;
        this.dataSource.data = this.rooms?.filter(
            (s) =>
                s?.name?.toLowerCase()?.includes(key?.toLowerCase()) ||
                s?.category?.toLowerCase()?.includes(key?.toLowerCase()) ||
                s?.type?.toLowerCase()?.includes(key?.toLowerCase())
        );
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;

    toggleRoomAvailability(room) {
        const isBlocking = room.available;
        const actionVerb = isBlocking ? 'bloquer' : 'rendre disponible';
        const actionColor = isBlocking ? 'text-red-600' : 'text-green-600';

        this.actionConfigDialogue.title = `Confirmer le changement de statut`;

        this.actionConfigDialogue.message = `
    Vous êtes sur le point de <b class="${actionColor}">${actionVerb}</b> la chambre <b>"${room.name}"</b>.<br><br>
    ${
        isBlocking
            ? "La chambre ne pourra plus être assignée à de nouvelles réservations jusqu'à sa réactivation."
            : 'La chambre sera de nouveau visible dans le planning et prête pour les réservations.'
    }
`;
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this._apiHousekeepingService
                    .toggleRoomAvailability(room.id)
                    .subscribe({
                        next: (value) => {
                            this._toast.success(
                                isBlocking
                                    ? 'Chambre bloquée'
                                    : 'Chambre disponible'
                            );

                            const index = this.rooms.findIndex(
                                (r) => r.id === room.id
                            );

                            if (index !== -1) {
                                this.rooms[index] = {
                                    ...this.rooms[index],
                                    available: !this.rooms[index].available,
                                };

                                this.dataSource.data = [...this.rooms];
                            }
                        },
                        error: (err) =>
                            this._toast.error(
                                err?.error?.description ||
                                    "Une erreur s'est produit"
                            ),
                    });
        });
    }

    raiseUpdateRoomStatus(room) {
        this._matDialog
            .open(RoomUpdateCleanStatusModel, {
                data: { room: room },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((data) => {
                if (data?.reload) {
                    const index = this.rooms.findIndex((r) => r.id === room.id);

                    if (index !== -1) {
                        this.rooms[index] = {
                            ...this.rooms[index],
                            clean: true,
                        };

                        this.dataSource.data = [...this.rooms];
                    }
                }
            });
    }
}
