import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize, Subject, takeUntil } from 'rxjs';
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
import jspdf from 'jspdf';
import autoTable from 'jspdf-autoTable';
import { User } from '../../../core/user/user.types';
import { UserService } from '../../../core/user/user.service';

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
export class HousekeepingHistoryComponent implements OnInit, OnDestroy {
    user;
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

    private _unsubscribeAll: Subject<any> = new Subject<any>();


    /**
     * Constructor
     */
    constructor(
        private _apiHousekeepingService: ApiHousekeepingService,
        private _apiRoomService: ApiRoomService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
        private _matDialog: MatDialog,
        private _userService: UserService,
        private _utilsService: UtilsService
    ) {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });
    }

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

    exportPDF(action: 'download' | 'print'): void {
        // 1. Initialisation du document au format A4 Paysage ('l' = landscape)
        const doc = new jspdf('l', 'mm', 'a4');
        const dateStr = new Date().toLocaleDateString('fr-FR');
        const hourStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const userName = this.user?.username || 'Système';

        // 2. En-tête du document
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.setFont('helvetica', 'bold');
        doc.text('RAPPORT DE CONTRÔLE ET NETTOYAGE DES CHAMBRES', 14, 15);

        // Métadonnées à droite
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        const rightMargin = 283; // Marge droite pour le format A4 paysage (297mm - 14mm)
        doc.text(`Généré par : ${userName}`, rightMargin, 15, { align: 'right' });
        doc.text(`Le ${dateStr} à ${hourStr}`, rightMargin, 20, { align: 'right' });

        // 3. Définition des colonnes du tableau
        const columns = [
            { header: 'CHAMBRE', dataKey: 'roomName' },
            { header: 'PAVILLON', dataKey: 'pavillon' },
            { header: 'TYPE', dataKey: 'roomType' },
            { header: 'ETAGE', dataKey: 'floor' },
            { header: 'AGENT', dataKey: 'agent' },
            { header: 'DÉBUT', dataKey: 'startAt' },
            { header: 'FIN', dataKey: 'endAt' },
            { header: 'OBSERVATIONS / COMMENTAIRES', dataKey: 'comment' }
        ];

        // Largeurs fixes pour les données courtes, et 'auto' pour la colonne des commentaires
        const colStyles = {
            roomName: { cellWidth: 25 },
            pavillon: { cellWidth: 35 },
            roomType: { cellWidth: 40 },
            floor: { cellWidth: 15 },
            agent: { cellWidth: 40 },
            startAt: { cellWidth: 32 },
            endAt: { cellWidth: 32 },
            comment: { cellWidth: 'auto' }
        };

        // 4. Extraction et formatage des données à partir de la collection JSON (content)
        // Supposons que vos données se trouvent dans 'this.collectionData.content'
        const sourceData = this.dataSource.data || [];

        const tableData = sourceData.map(item => {
            const agentName = item.agent
                ? `${item.agent.lastName.toUpperCase()} ${item.agent.firstName}`
                : '-';

            return {
                roomName: item.room?.name || '-',
                pavillon: item.room?.pavillon?.name || '-',
                roomType: item.room?.roomType?.type || '-',
                floor: item.room?.floor !== undefined ? `Étage ${item.room.floor}` : '-',
                agent: agentName,
                startAt: item.startAt ? item.startAt : '-',
                endAt: item.endAt ? item.endAt : '-',
                comment: item.comment || ''
            };
        });

        // 5. Génération du tableau avec jspdf-autotable
        autoTable(doc, {
            columns: columns,
            body: tableData,
            startY: 30,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 5,
                minCellHeight: 10,
                valign: 'middle',
                lineColor: [226, 232, 240], // #e2e8f0
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [15, 23, 42], // Fond sombre #0f172a (Style Institutionnel)
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center'
            },
            //columnStyles: colStyles, // to fixe later
            didParseCell: (data) => {
                // Centrer le texte pour les colonnes administratives fixes
                if (['roomName', 'pavillon', 'floor', 'startAt', 'endAt'].includes(data.column.dataKey as string)) {
                    data.cell.styles.halign = 'center';
                }
                // Mettre en gras le nom de la chambre
                if (data.column.dataKey === 'roomName') {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = [30, 64, 175]; // Couleur bleue #1e40af
                }
                // Style d'alerte discret s'il y a un commentaire d'anomalie (ex: "Tv cassée")
                if (data.column.dataKey === 'comment' && data.cell.raw !== '') {
                    data.cell.styles.textColor = [185, 28, 28]; // Rouge brique
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        // 6. Gestion du pied de page pour le multipage (Numérotation)
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // #94a3b8
            // 148.5 mm correspond au milieu d'une page A4 en mode Paysage (297mm / 2)
            doc.text(`Document interne confidentiel - Page ${i} sur ${pageCount}`, 148.5, 202, { align: 'center' });
        }

        // 7. Action finale : Téléchargement ou impression
        if (action === 'download') {
            const formattedDate = dateStr.replace(/\//g, '-');
            doc.save(`RAPPORT_CONTROLE_${formattedDate}.pdf`);
        } else {
            const blob = doc.output('bloburl');
            window.open(blob, '_blank');
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
