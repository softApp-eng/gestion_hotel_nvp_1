import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule, MatDateRangeInput } from '@angular/material/datepicker';
import {  MatSelectModule } from '@angular/material/select';
import { UtilsService } from '../../../core/service/utils.service';
import { ApiHousekeepingService } from '../api.housekeeping.service';
import { ApiRoomService } from '../../pavillon/api.room.service';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { Toastr } from '../../../core/service/toastr.service';
import { AgentCreateModel } from '../agent/dialog-create-agent/agent-create.model';
import { MatDialog } from '@angular/material/dialog';
import { RoomUpdateCleanStatusModel } from '../housekeeping/dialog-update-room-status/room-update-clean-status.model';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'audit',
    templateUrl: './housekeeping.history.component.html',
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
        FormsModule,
        DatePipe,
        MatDateRangeInput,
        MatSelectModule,
        MatDatepickerModule,
        NgClass,
        DisableIfNoPermissionDirective,
        MatCheckbox,
    ],
})
export class HousekeepingHistoryComponent implements OnInit {
    displayedColumns: string[] = [
        'room',
        'agent',
        'date',
        'Heure',
        'anomalie',
        'action',
    ];
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;

    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];
    isLoading: boolean = true;

    rooms = [];
    //roomsTypes = [];
    agents = [];

    filters = {
        key: '',
        rooms: [],
        //roomsTypes: [],
        agents: [],
        startDate: null,
        endDate: null,
        anomalie: false,
    };

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
        private _apiHousekeepingService: ApiHousekeepingService,
        private _apiRoomService: ApiRoomService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
        private _matDialog: MatDialog,
        private _utilsService: UtilsService
    ) {}

    ngOnInit(): void {
        this.loadAgents();
        this.loadRooms();
        this.search();
    }

    get activeFiltersCount(): number {
        let count = 0;
        if (this.filters.key?.length > 0) count++;
        if (this.filters.rooms.length > 0) count++;
        if (this.filters.anomalie) count++;
        //if (this.filters.roomsTypes.length > 0) count++;
        if (this.filters.agents.length > 0) count++;
        if (this.filters.startDate || this.filters.endDate) count++;
        return count;
    }

    applyFilters(trigger?: MatMenuTrigger) {
        if (trigger) {
            trigger.closeMenu();
        }

        this.currentPage = 0;
        this.search();
    }

    resetFilters(trigger?: MatMenuTrigger) {
        if (trigger) {
            trigger.closeMenu();
        }
        this.filters = {
            key: '',
            rooms: [],
            //roomsTypes: [],
            agents: [],
            startDate: null,
            endDate: null,
            anomalie: false,
        };
        this.applyFilters();
    }

    getSelectedFilterLabels(
        target: 'rooms' | 'roomsTypes' | 'agents' | 'anomalie'
    ): string {
        let labels;
        if (target == 'rooms')
            labels = this.filters.rooms
                .map((id) => this.rooms.find((item) => item.id === id)?.code)
                .filter((name) => !!name)
                .join(', ');

        if (target == 'agents')
            labels = this.filters.agents
                .map(
                    (id) => this.agents.find((item) => item.id === id)?.lastName
                )
                .filter((name) => !!name)
                .join(', ');

        if (target == 'anomalie') labels = 'Anomalies';

        return labels;
    }

    removeSpecificFilter(filter: string) {
        if (filter == 'key') this.filters.key = '';
        if (filter == 'rooms') this.filters.rooms = [];
        //if (filter == 'roomsTypes') this.filters.roomsTypes = [];
        if (filter == 'agents') this.filters.agents = [];
        if (filter == 'anomalie') this.filters.anomalie = false;

        if (filter == 'range') {
            this.filters.startDate = null;
            this.filters.endDate = null;
        }

        this.search();
    }

    loadAgents() {
        this._apiHousekeepingService.listAllAgent().subscribe({
            next: (data) => {
                this.agents = data;
            },
        });
    }

    loadRooms() {
        this._apiRoomService.grantedRooms().subscribe({
            next: (data) => {
                this.rooms = data;
                //this.roomsTypes = data?.map(r => r.roomType?.type);
            },
        });
    }

    search() {
        this.isLoading = true;
        this.dataSource.data = [];

        this._apiHousekeepingService
            .search(
                this.filters.key,
                //this.filters.roomsTypes,
                this.filters.rooms,
                this.filters.agents,
                this.filters.startDate
                    ? this._utilsService.convertToDate(this.filters.startDate)
                    : '',
                this.filters.endDate
                    ? this._utilsService.convertToDate(this.filters.endDate)
                    : '',
                this.filters.anomalie,
                this.currentPage,
                this.pageSize
            )
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.dataSource.data = value?.content || [];
                    this.totalRows = value?.totalElements || 0;
                    console.log(value);
                    setTimeout(() => {
                        if (this._paginator) {
                            this._paginator.pageIndex = this.currentPage;
                            this._paginator.length = this.totalRows;
                        }
                    });
                },
            });
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.search();
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;

    raiseUpdateHistory(history) {
        this._matDialog
            .open(RoomUpdateCleanStatusModel, {
                data: { history: history },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((data) => {
                if (data?.reload) {
                    this.search();
                }
            });
    }

    deleteHistory(history) {
        this.actionConfigDialogue.title = `Confirmer la suppression".`;
        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer cet historique ?<br> Cette action est irréversible.`;
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this._apiHousekeepingService
                    .deleteHistory(history.id)
                    .subscribe({
                        next: (value) => {
                            this._toast.success('Historique supprimé');
                            this.dataSource.data = this.dataSource.data.filter(
                                (s) => s.id !== history.id
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
}
