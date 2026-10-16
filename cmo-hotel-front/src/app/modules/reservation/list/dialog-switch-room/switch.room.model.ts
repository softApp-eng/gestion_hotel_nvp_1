import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder, UntypedFormGroup, Validators,
} from '@angular/forms';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { ApiReservationService } from '../../api.reservation.service';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { MatRipple } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { AssignRoomsModel } from '../../room-assign/assign-rooms.model';
import { MatTooltip } from '@angular/material/tooltip';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../../@fuse/services/confirmation';
import { roomFloorLabel } from '../../../../core/data/room-floor';

@Component({
    selector: 'switch-room',
    templateUrl: './switch.room.model.html',
    styleUrls: ['./switch.room.model.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatTableModule,
        FormsModule,
        MatRipple,
        NgClass,
        DatePipe,
        MatTooltip,
    ],
})
export class SwitchRoomModel implements OnInit {

    /** Étage d'une chambre (déduit du n° de chambre, cf. room-floor.ts). */
    floorLabel(room: any): string {
        return roomFloorLabel(room);
    }

    isReload:boolean = false;
    step = 0; // 0: Sélection occupant, 1: Vue Historique, 2: Formulaire de transfert
    reservation: any;
    selectedGuest: any;
    dialogTitle = 'Changement de Chambre';

    displayedColumns: string[] = [
        'previous',
        'new',
        'pavillon',
        'reason',
        'actions',
    ];
    tableDataSource: any[] = [];

    switchForm: UntypedFormGroup;
    selectedNewRoom: any = null; // Chambre sélectionnée depuis votre picker

    cancelSwitchActionConfigDialogue: FuseConfirmationConfig = {
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
                label: "Confirmer l'annulation",
                color: 'warn',
            },
            cancel: {
                show: true,
                label: 'Conserver',
            },
        },
        dismissible: true,
    };
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<SwitchRoomModel>,
        private _apiReservationService: ApiReservationService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: ToastrService,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA)
        public data: { reservation: any; selectedGuestId?: any; title?: string }
    ) {
        this.reservation = data.reservation;
        if (data?.title) {
            this.dialogTitle = data.title;
        }
    }

    ngOnInit(): void {
        this.switchForm = this._formBuilder.group({
            reservationId: [this.reservation?.code, [Validators.required]],
            newRoomId: [null, [Validators.required]],
            reason: ['', [Validators.required]],
            appliedPrice: [null, [Validators.required, Validators.min(0)]],
        });

        // Ouverture contextuelle : si un occupant est déjà ciblé (ex: page Délogement),
        // on passe directement à l'historique de ses transferts.
        const preselectedId = this.data?.selectedGuestId;
        if (preselectedId) {
            const guest = this.reservation?.guests?.find(
                (g: any) => g.id === preselectedId
            );
            if (guest) {
                this.selectGuest(guest);
            }
        }
    }

    getAppliedPriceForPerson(room: any, person: any): number {
        console.log('1', room);
        console.log('2', person);
        if (!room || !room.roomType || !room.roomType.prices || !person) {
            return 0;
        }

        // Extraction du code de catégorie du grade (ex: "OFFICIER_SUPERIEUR", "CIVIL", etc.)
        const categoryCode = person.grade?.category?.code;

        if (!categoryCode) {
            return 0;
        }

        // Recherche de la grille tarifaire correspondant à cette catégorie pour ce type de chambre
        const priceEntry = room.roomType.prices.find(
            (p: any) => p.category?.code === categoryCode
        );

        return priceEntry ? priceEntry.price : 0;
    }

    selectGuest(guest: any): void {
        this.selectedGuest = guest;

        this._apiReservationService
            .getSwitchedRoom(this.selectedGuest.id)
            .subscribe({
                next: (switchedRooms: any[]) => {
                    console.log('switched rooms', switchedRooms);
                    this.buildTableDataSource(switchedRooms || []);
                    this.step = 1;
                },
                error: () => {
                    // En cas d'erreur API, afficher au moins la chambre initiale
                    this.buildTableDataSource([]);
                    this.step = 1;
                },
            });
    }

    stepTo(stepIndex: number): void {
        this.step = stepIndex;
    }

    /**
     * Recompose les lignes du tableau :
     * Si l'historique est vide, affiche la chambre d'attribution initiale.
     */
    buildTableDataSource(history: any[]): void {
        if (!this.selectedGuest) return;

        const initialRoom =
            history.length > 0
                ? history[0].previousRoom
                : this.selectedGuest.room;

        const initialPrice =
            history.length > 0
                ? history[0].previousPrice
                : this.selectedGuest.appliedPrice;

        const initialRow = {
            isInitial: true,
            previousRoom: {
                code: '—',
                roomType: { type: 'Attribution initiale' },
            },
            newRoom: initialRoom,
            switchTime: null,
            reason: 'Chambre attribuée à la création',
            appliedPrice: initialPrice,
        };

        // Normalisation des dates de l'historique
        const formattedHistory = history.map((item) => ({
            ...item,
            switchTime: this.parseJacksonDate(item.switchTime),
        }));

        // Inversion : les transferts d'abord, la ligne initiale tout en bas
        this.tableDataSource = [...formattedHistory, initialRow];
    }

    /**
     * Ouvre votre modal de sélection de chambre éligible
     */
    openRoomPicker(): void {
        if (!this.reservation) return;

        const currentOccupations = this.getExistingOccupations();
        this._matDialog
            .open(AssignRoomsModel, {
                data: {
                    start: this.reservation.checkin,
                    end: this.reservation.plannedEnd,
                    existingOccupations: currentOccupations,
                },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                // Extraction du payload retourné par le dialogue (result.room)
                const chosenRoom = result?.room || result;

                // 1. Vérification : Est-ce que la nouvelle chambre est la même que l'actuelle ?
                const currentRoomId = this.selectedGuest?.room?.id;

                if (currentRoomId && chosenRoom.id === currentRoomId) {
                    this._toast.warning(
                        "L'occupant se trouve déjà dans cette chambre. Veuillez sélectionner une chambre différente."
                    );
                    return; // Bloque la sélection et stoppe l'exécution
                }

                if (chosenRoom && chosenRoom.id) {
                    this.selectedNewRoom = chosenRoom;

                    // Calculer le prix appliqué pour l'occupant sélectionné
                    const calculatedPrice = this.getAppliedPriceForPerson(
                        chosenRoom,
                        this.selectedGuest.person
                    );

                    console.log('applied price is ', calculatedPrice);

                    // Patcher la valeur dans le FormGroup pour la validation
                    this.switchForm.patchValue({
                        newRoomId: chosenRoom.id,
                        appliedPrice: calculatedPrice,
                    });

                    this.switchForm.get('newRoomId')?.markAsTouched();
                }
            });
    }

    private getExistingOccupations(): any[] {
        const occupationsMap = new Map<
            number,
            { roomId: number; rangeOccupation: any; numberOfPersons: number }
        >();

        this.reservation.guests.forEach((p) => {
            if (p.room && p.room.id) {
                const roomId = p.room.id;
                if (!occupationsMap.has(roomId)) {
                    occupationsMap.set(roomId, {
                        roomId: roomId,
                        rangeOccupation: {
                            start: this.formatToISO(this.reservation.checkin),
                            end: this.formatToISO(this.reservation.plannedEnd),
                        },
                        numberOfPersons: 0,
                    });
                }
                occupationsMap.get(roomId).numberOfPersons++;
            }
        });

        return Array.from(occupationsMap.values());
    }

    private formatToISO(dateInput: any): string {
        if (!dateInput) return '';

        const date = new Date(dateInput);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day} 12:00`;
    }
    confirmSwitch(): void {
        if (this.switchForm.invalid) {
            this.switchForm.markAllAsTouched();
            return;
        }

        const payload = {
            reservationId: String(this.selectedGuest.id),
            newRoomId: Number(this.switchForm.get('newRoomId').value),
            reason: this.switchForm.get('reason').value,
            appliedPrice: this.switchForm.get('appliedPrice').value,
        };

        this._apiReservationService.switchRoom(payload).subscribe({
            next: () => {
                this._toast.success(
                    'Changement de chambre effectué avec succès'
                );
                this.isReload = true;
                this.matDialogRef.close({ reload: this.isReload });
            },
            error: (err) => {
                this._toast.error(
                    err?.error?.message ||
                        'Erreur lors du changement de chambre'
                );
            },
        });
    }

    private parseJacksonDate(dateArray: any): Date | null {
        if (!dateArray) return null;
        if (dateArray instanceof Date) return dateArray;

        // Si c'est le tableau retourné par Spring Boot: [2026, 10, 2, 20, 22, 36, 872751000]
        if (Array.isArray(dateArray)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] =
                dateArray;
            // Les mois dans Date JS vont de 0 (Janvier) à 11 (Décembre)
            return new Date(year, month - 1, day, hour, minute, second);
        }

        return new Date(dateArray);
    }

    isLastSwitch(element: any): boolean {
        if (!element || element.isInitial) return false;

        // Récupération de la liste brute du tableau
        const data = Array.isArray(this.tableDataSource)
            ? this.tableDataSource
            : [];

        // Extraction de tous les switchs réels (exclut la ligne d'attribution initiale)
        const realSwitches = data.filter((item: any) => !item.isInitial);

        if (realSwitches.length === 0) return false;

        // Le dernier switch est le premier élément de l'historique trié par date décroissante
        const lastSwitch = realSwitches[0];

        return element.id === lastSwitch.id;
    }

    /**
     * Annule le dernier changement de chambre
     */
    cancelSwitch(element: any): void {
        if (!this.selectedGuest?.id || !element?.id) return;

        const guestName =
            `${this.selectedGuest.person?.firstName || ''} ${this.selectedGuest.person?.lastName || ''}`.trim();
        const previousRoom =
            element.previousRoom?.code || 'sa chambre précédente';

        this.cancelSwitchActionConfigDialogue.title =
            'Annuler le transfert de chambre';
        this.cancelSwitchActionConfigDialogue.message =
            `Êtes-vous sûr de vouloir annuler le dernier transfert de chambre pour <strong>${guestName}</strong> ?<br>` +
            `Le résident réintégrera la chambre <strong>${previousRoom}</strong>.`;

        const dialogRef = this._fuseConfirmationService.open(
            this.cancelSwitchActionConfigDialogue
        );

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._apiReservationService
                    .removeRoomSwitch(this.selectedGuest.id, element.id)
                    .subscribe({
                        next: () => {
                            this._toast.success(
                                'Le changement de chambre a été annulé avec succès'
                            );

                            // Rétablir localement la chambre précédente avant le rechargement
                            if (element.previousRoom) {
                                this.selectedGuest.room = element.previousRoom;
                            }

                            this.tableDataSource = this.tableDataSource.filter(
                                (item) => item.id !== element.id
                            );

                            // 3. Optionnel : Si besoin d'une réassignation forcée pour le composant MatTable
                            this.tableDataSource = [...this.tableDataSource];

                            // Recharger l'historique pour synchroniser l'affichage
                            this.selectGuest(this.selectedGuest);
                            this.isReload = true;
                        },
                        error: (err) => {
                            this._toast.error(
                                err?.error?.message ||
                                    "Erreur lors de l'annulation du changement de chambre"
                            );
                        },
                    });
            }
        });
    }
}
