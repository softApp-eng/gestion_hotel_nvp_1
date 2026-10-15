import {
    Component,
    OnInit,
    ViewChild, ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { ApiReservationService } from '../../reservation/api.reservation.service';
import { ReservationDetailsModel } from '../../reservation/dialog-reservation-details/reservation.details.model';
import { CloseReservationModel } from '../../reservation/list/dialog-close-reservation/close.reservation.model';
import { NightValidationModel } from '../night-validation/night-validation.model';
import { TimeExtendModel } from '../time-extend/time-extend.model';
import { Toastr } from '../../../core/service/toastr.service';
import { PaymentModel } from '../../invoice/payment-model/payment.model';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { ApiInvoiceService } from '../../invoice/api.invoice.service';
import { PrestationMonoCreateModel } from '../../restauration/create-one-prestation-model/prestation-mono-create.model';

@Component({
    selector: 'sejour-list',
    templateUrl: './sejour.list.component.html',
    styleUrls: ['./sejour.list.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatIconModule,
        MatButtonModule,
        HighlightPipe,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        NgClass,
        MatPaginator,
        MatIconModule,
        FormsModule,
        MatTabsModule,
        MatSelectModule,
        DatePipe,
        SlicePipe,
        DisableIfNoPermissionDirective,
    ],
})
export class SejourListComponent implements OnInit {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'code',
        'period',
        'nights',
        'category',
        'roomAndGuests',
        'action',
    ];

    reservations;

    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];
    key = '';
    today = new Date();
    loadingFicheId: number | null = null;
    roomOptions: string[] = [];
    selectedRoom = '';

    actionProceedToPaymentConfigDialogue: FuseConfirmationConfig = {
        title: 'Paiement / Encaissement',
        message: '',
        icon: {
            show: true,
            name: 'heroicons_outline:credit-card',
            color: 'primary',
        },
        actions: {
            confirm: {
                show: true,
                label: 'Procéder au paiement',
                color: 'primary',
            },
            cancel: {
                show: true,
                label: 'Plus tard',
            },
        },
        dismissible: true,
    };

    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _matDialog: MatDialog,
        private _apiInvoiceService: ApiInvoiceService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toastr: Toastr
    ) {}

    ngOnInit(): void {
        this.dataSource.paginator = this._paginator;
        this.getSejour();
    }

    getSejour() {
        this.isLoading = true;
        this.dataSource.data = [];
        this._apiReservationService
            .getSejours()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    value?.forEach((row) => {
                        if (row?.guests) {
                            row?.guests.sort((a, b) => {
                                const orderA = a.role?.order || 0;
                                const orderB = b.role?.order || 0;
                                return orderA - orderB;
                            });
                        }
                    });
                    this.reservations = this.dataSource.data = value || [];
                    this.totalRows = value?.length || 0;
                    this.buildRoomOptions(value || []);
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

    raiseReservationDetailsDialog(reservation) {
        this._matDialog
            .open(ReservationDetailsModel, {
                data: { reservation: reservation },
                disableClose: true,
            })
            .afterClosed()
            .subscribe();
    }

    /*raiseCloseReservation(code) {
        if (!code) return;
        this._matDialog
            .open(CloseReservationModel, {
                data: { code: code },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result.reload) {
                    this.getSejour();
                }
            });
    }*/
    raiseCloseReservation(code: string) {
        if (!code) return;

        // 1. Ouverture du modal de clôture de réservation
        this._matDialog
            .open(CloseReservationModel, {
                data: { code: code },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                // Si la réservation a été clôturée avec succès
                if (result?.reload) {
                    this.getSejour(); // Rafraîchir les données

                    // 2. Préparation et ouverture du dialogue de confirmation
                    this.actionProceedToPaymentConfigDialogue.title =
                        'Clôture effectuée avec succès';
                    this.actionProceedToPaymentConfigDialogue.message = `La réservation <b>#${code}</b> a été clôturée.<br>Voulez-vous procéder à l'encaissement maintenant ?`;

                    const dialogRef = this._fuseConfirmationService.open(
                        this.actionProceedToPaymentConfigDialogue
                    );

                    // 3. Traitement du choix de l'utilisateur
                    dialogRef.afterClosed().subscribe((confirmationResult) => {
                        if (confirmationResult === 'confirmed') {
                            // 4. Si 'confirmed', ouverture du modal de paiement
                            this._apiInvoiceService
                                .getInvoiceByReservationCode(code)
                                .subscribe({
                                    next: (value) => {
                                        this._matDialog
                                            .open(PaymentModel, {
                                                data: { invoice: value },
                                                disableClose: true,
                                            })
                                            .afterClosed()
                                            .subscribe((paymentResult) => {
                                                if (paymentResult?.reload) {
                                                    this.getSejour();
                                                }
                                            });
                                    },
                                });
                        }
                        // Si 'cancel' ou fermé, le flux s'arrête proprement
                    });
                }
            });
    }

    raiseNightValidate() {
        this._matDialog
            .open(NightValidationModel, {
                data: { reservations: this.reservations },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result.reload) {
                    this.getSejour();
                }
            });
    }

    raiseTimeExtend(r) {
        this._matDialog
            .open(TimeExtendModel, {
                data: { reservation: r },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result.reload) {
                    this.getSejour();
                }
            });
    }

    raiseAddPrestation(guest: any, row?: any) {
        if (!guest?.id) return;
        this._matDialog
            .open(PrestationMonoCreateModel, {
                data: {
                    reservation: guest.id,
                    category: guest?.person?.grade?.category,
                    beneficiary: guest?.person,
                    room: guest?.room,
                    code: row?.code ?? guest?.details?.code,
                },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result?.reload) {
                    this.getSejour();
                }
            });
    }

    isOverdue(dateString: any): boolean {
        if (!dateString) return false;
        const dateToCheck = new Date(dateString);
        this.today.setHours(0, 0, 0, 0);
        dateToCheck.setHours(0, 0, 0, 0);
        return dateToCheck < this.today;
    }

    search(key: string): void {
        this.key = key?.trim().toLowerCase();
        this.applyFilters();
    }

    filterByRoom(room: string): void {
        this.selectedRoom = room || '';
        this.applyFilters();
    }

    buildRoomOptions(rows: any[]): void {
        const rooms = new Set<string>();
        rows?.forEach((row) => {
            row?.guests?.forEach((guest: any) => {
                const code = guest?.room?.code || guest?.room?.name;
                if (code) rooms.add(code);
            });
        });
        this.roomOptions = Array.from(rooms).sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true })
        );
    }

    applyFilters(): void {
        let data = this.reservations || [];

        // Filtre par numéro de chambre
        if (this.selectedRoom) {
            data = data.filter((res) =>
                res.guests?.some(
                    (guest: any) =>
                        guest?.room?.code === this.selectedRoom ||
                        guest?.room?.name === this.selectedRoom
                )
            );
        }

        // Filtre par mot-clé (personne, chambre, code...)
        if (this.key) {
            data = data.filter((res) => {
                const basicInfo = [
                    res.code,
                    res.status?.name,
                    res.category?.name,
                    res.observation,
                ]
                    .join(' ')
                    .toLowerCase();

                if (basicInfo.includes(this.key)) return true;

                return res.guests?.some((guest: any) => {
                    const p = guest.person;
                    const r = guest.room;

                    const personInfo = [
                        p?.firstName,
                        p?.lastName,
                        p?.identity,
                        p?.matricule,
                        p?.grade?.code,
                        p?.grade?.name,
                        r?.name,
                        r?.roomType?.type,
                    ]
                        .join(' ')
                        .toLowerCase();

                    return personInfo.includes(this.key);
                });
            });
        }

        this.dataSource.data = data;
        this.totalRows = data.length;

        // Retour à la première page de la pagination après filtrage
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
        if (this._paginator) {
            this._paginator.length = this.totalRows;
        }
    }

    getNightsTooltip(row: any): string {
        if (!row.validatedNights || row.validatedNights.length === 0) {
            return "Aucune nuitée n'a encore été validée.";
        }

        const details = row.validatedNights
            .map((n) => {
                const date = new Date(n.nightDate).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                });
                return `• Le ${date} (${n.roomName} - ${n.roomPriceApplied} Dhs)`;
            })
            .join('\n'); // Le \n sera maintenant interprété grâce au CSS global

        const totalAmount = row.validatedNights.reduce(
            (sum, n) => sum + (n.roomPriceApplied || 0),
            0
        );

        return (
            `DÉTAIL DES NUITS :\n` +
            `--------------------------\n` +
            `${details}\n` +
            `--------------------------\n` +
            `TOTAL : ${totalAmount} Dhs`
        );
    }

    getUniqueNightsCount(row: any): number {
        if (!row.validatedNights || row.validatedNights.length === 0) {
            return 0;
        }
        const uniqueDates = new Set(
            row.validatedNights.map((n) => n.nightDate)
        );
        return uniqueDates.size;
    }

    getGroupedRooms(guests: any[]): any[] {
        if (!guests) return [];

        const groups = guests.reduce((acc, guest) => {
            const roomId = guest.room.id;
            if (!acc[roomId]) {
                const roomHistory: string[] = [];

                if (guest.switchRooms && guest.switchRooms.length > 0) {
                    // Ajouter les anciennes chambres dans l'ordre de transfert
                    guest.switchRooms.forEach((sw: any) => {
                        if (
                            sw.previousRoom?.name &&
                            !roomHistory.includes(sw.previousRoom.name)
                        ) {
                            roomHistory.push(sw.previousRoom.name);
                        }
                    });
                }

                // Ajouter la chambre actuelle en fin de parcours
                if (
                    guest.room?.name &&
                    !roomHistory.includes(guest.room.name)
                ) {
                    roomHistory.push(guest.room.name);
                }
                acc[roomId] = {
                    room: guest.room,
                    occupants: [],
                    transferHistory:
                        roomHistory.length > 1 ? roomHistory.join(' > ') : null,
                };
            }
            acc[roomId].occupants.push(guest);
            return acc;
        }, {});

        return Object.values(groups);
    }

    processInvoice(row: any, action: 'download' | 'view'): void {
        if (!row?.code) return;

        this.loadingFicheId = row.code;

        // Pré-ouverture synchrone de l'onglet pour éviter le blocage des popups
        const viewTab = action === 'view' ? window.open('', '_blank') : null;

        this._apiReservationService
            .generateInvoiceProFormatPdf(row.code)
            .subscribe({
                next: (blob: Blob) => {
                    const blobUrl = window.URL.createObjectURL(blob);

                    if (action === 'download') {
                        // CAS 1 : TELECHARGEMENT
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `Facture_proforma_${row.code}.pdf`;
                        link.click();
                        // Nettoyage de la mémoire
                        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
                    } else {
                        // CAS 2 : AFFICHAGE dans le nouvel onglet pré-ouvert
                        if (viewTab) {
                            viewTab.location.href = blobUrl;
                            viewTab.focus();
                        } else {
                            window.open(blobUrl, '_blank');
                        }
                        // Nettoyage différé pour laisser le temps à l'onglet de charger
                        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
                    }

                    this.loadingFicheId = null;
                },
                error: (err) => {
                    viewTab?.close();
                    console.error('Erreur PDF:', err);
                    this.loadingFicheId = null;
                    this._toastr.error(
                        'erreur de generation de la facture de réservation'
                    );
                    // Optionnel : Afficher un SnackBar d'erreur
                },
            });
    }
}
