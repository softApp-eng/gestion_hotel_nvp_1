import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HighlightPipe } from '../../../../../@fuse/pipes/HighlightPipe';
import { APP_PERMISSIONS } from '../../../../core/data/app-permissions';
import { roomFloorLabel } from '../../../../core/data/room-floor';
import { DisableIfNoPermissionDirective } from '../../../../core/auth/DisableIfNoPermissionDirective';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { ApiRoomService } from '../../../pavillon/api.room.service';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../../@fuse/services/confirmation';
import { Toastr } from '../../../../core/service/toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiHousekeepingService } from '../../api.housekeeping.service';
import { AgentCreateModel } from '../../agent/dialog-create-agent/agent-create.model';
import { RoomUpdateCleanStatusModel } from '../dialog-update-room-status/room-update-clean-status.model';
import { FormsModule } from '@angular/forms';
import jspdf from 'jspdf';
import autoTable from 'jspdf-autoTable';
import { User } from '../../../../core/user/user.types';
import { UserService } from '../../../../core/user/user.service';

@Component({
    selector: 'housekeeping-room-list',
    templateUrl: './housekeeping.list.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        RouterLink,
        HighlightPipe,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        MatPaginator,
        MatSortModule,
        NgClass,
        FormsModule,
        NgIf,
    ],
})
export class HousekeepingListComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    user;
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
        private _apiRoomService: ApiRoomService,
        private _apiHousekeepingService: ApiHousekeepingService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
        private _userService: UserService,
        private _matDialog: MatDialog
    ) {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });
    }

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
                    this.dataSource.data = this.rooms = (value || []).map((r: any) => ({
                        ...r,
                        floorLabel: roomFloorLabel(r),
                    }));
                    this.dataSource.paginator = this._paginator;
                    this.counts = this.rooms.reduce(
                        (acc, room) => {
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
                        },
                        {
                            propre: 0,
                            sale: 0,
                            occupe: 0,
                            horsService: 0,
                        }
                    );
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

    exportPDF(type: 'fiche' | 'global', action: 'download' | 'print'): void {
        const doc = new jspdf('l', 'mm', 'a4');
        const dateStr = new Date().toLocaleDateString('fr-FR');
        const hourStr = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });

        const userName = this.user?.username;

        doc.setFontSize(18);
        doc.setTextColor(40, 44, 52);
        const title =
            type === 'fiche'
                ? 'FICHE DE CONTRÔLE NETTOYAGE'
                : 'ÉTAT GLOBAL DES CHAMBRES';
        doc.text(title, 14, 15);

        doc.setFontSize(10);
        doc.setTextColor(100);
        const rightMargin = 283;
        doc.text(`Généré par : ${userName}`, rightMargin, 15, {
            align: 'right',
        });
        doc.text(`Le ${dateStr} à ${hourStr}`, rightMargin, 20, {
            align: 'right',
        });

        //doc.text(`Établissement : Votre Hôtel`, 14, 22);

        if (type === 'global') {
            const stats = [
                {
                    label: 'PROPRE',
                    value: this.counts.propre,
                    color: [34, 197, 94],
                },
                {
                    label: 'SALE',
                    value: this.counts.sale,
                    color: [239, 68, 68],
                },
                {
                    label: 'OCCUPÉES',
                    value: this.counts.occupe,
                    color: [79, 70, 229],
                },
                {
                    label: 'HORS SERVICE',
                    value: this.counts.horsService,
                    color: [100, 116, 139],
                },
            ];

            let startX = 14;
            const rectWidth = 45;
            const rectHeight = 15;

            stats.forEach((stat) => {
                doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
                doc.setLineWidth(1);
                doc.line(startX, 28, startX, 28 + rectHeight);
                doc.setFontSize(8);
                doc.setTextColor(120);
                doc.text(stat.label, startX + 3, 33);
                doc.setFontSize(14);
                doc.setTextColor(40);
                doc.setFont('courier', 'bold');
                doc.text(stat.value.toString(), startX + 3, 40);
                startX += rectWidth + 10;
            });
            doc.setFont('helvetica', 'normal'); // Reset font
        }

        let columns: any[];
        let tableData: any[];
        let colStyles: any;

        if (type === 'fiche') {
            columns = [
                { header: 'CHAMBRE', dataKey: 'name' },
                { header: 'ETAGE', dataKey: 'floor' },
                { header: 'STATUT', dataKey: 'status' },
                { header: 'AGENT', dataKey: 'agent' },
                { header: 'HE / HS', dataKey: 'time' },
                { header: 'ANOMALIES / OBSERVATIONS', dataKey: 'obs' },
            ];
            colStyles = {
                name: { cellWidth: 30 },
                floor: { cellWidth: 25 },
                status: { cellWidth: 35 },
                agent: { cellWidth: 45 },
                time: { cellWidth: 35 },
                obs: { cellWidth: 'auto' },
            };
            tableData = this.dataSource.data.map((r) => ({
                name: r.name,
                floor: r.floorLabel ?? roomFloorLabel(r),
                status: r.reserved ? 'OCCUPÉE' : 'LIBRE',
                agent: '',
                time: '',
                obs: '',
            }));
        } else {
            columns = [
                { header: 'CHAMBRE', dataKey: 'name' },
                { header: 'TYPE', dataKey: 'type' },
                { header: 'ETAGE', dataKey: 'floor' },
                { header: 'RESERVATION', dataKey: 'status' },
                { header: 'PROPRETÉ', dataKey: 'clean' },
                { header: 'DISPONIBILITÉ', dataKey: 'dispo' },
            ];
            colStyles = {
                name: { cellWidth: 35 },
                type: { cellWidth: 50 },
                floor: { cellWidth: 25 },
                status: { cellWidth: 40 },
                clean: { cellWidth: 40 },
                dispo: { cellWidth: 'auto' },
            };
            tableData = this.dataSource.data.map((r) => ({
                name: r.name,
                type: r.roomType?.type || 'Standard',
                floor: r.floorLabel ?? roomFloorLabel(r),
                status: r.reserved ? 'OCCUPÉE' : 'LIBRE',
                clean: r.clean ? 'PROPRE' : 'SALE',
                dispo: r.available ? 'OPÉRATIONNELLE' : 'HORS SERVICE',
            }));
        }

        autoTable(doc, {
            columns: columns,
            body: tableData,
            startY: type === 'global' ? 50 : 30,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 4,
                minCellHeight: type === 'fiche' ? 12 : 8,
                valign: 'middle',
                lineColor: [210, 210, 210],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [45, 55, 72],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center',
            },
            columnStyles: colStyles,
            didParseCell: (data) => {
                if (
                    ['name', 'floor', 'status', 'clean', 'dispo'].includes(
                        data.column.dataKey as string
                    )
                ) {
                    data.cell.styles.halign = 'center';
                }
                if (
                    data.column.dataKey === 'dispo' &&
                    data.cell.raw === 'HORS SERVICE'
                ) {
                    data.cell.styles.textColor = [200, 0, 0];
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Document confidentiel - Page ${i} sur ${pageCount}`,
                148.5,
                205,
                { align: 'center' }
            );
        }

        if (action === 'download') {
            doc.save(`${type}_${dateStr.replace(/\//g, '-')}.pdf`);
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
