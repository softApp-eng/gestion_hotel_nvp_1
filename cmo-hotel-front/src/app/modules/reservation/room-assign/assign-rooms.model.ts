import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { ApiPavillonService } from '../../pavillon/api.pavillon.service';
import { ApiRoomService } from '../../pavillon/api.room.service';
import { NgClass } from '@angular/common';

interface RoomStatus {
    isDisabled: boolean;
    reason?: string;
}

@Component({
    selector: 'rooms-assign-model',
    templateUrl: './assign-rooms.model.html',
    styles: [`
        .mat-mdc-option .mdc-list-item__primary-text {
            width: 100% !important;
            display: block !important;
        }
    `],
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
        FormsModule,
        NgClass,
    ],
})
export class AssignRoomsModel implements OnInit {
    title = 'Assigner une chambre';
    pavillons;
    rooms = [];
    isRoomLoading = false;
    selectedRoom: any;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        public matDialogRef: MatDialogRef<AssignRoomsModel>,
        public _apiPavillonService: ApiPavillonService,
        public _apiRoomService: ApiRoomService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: {start: any; end: any, existingOccupations: any }
    ) {
        console.log('start', data.start);
        console.log('end', data.end);
        console.log('existingOccupations', data.existingOccupations);
    }

    ngOnInit(): void {
        this.loadPavillons();
    }

    loadPavillons() {
        this._apiPavillonService.all().subscribe({
            next: (data) => {
                this.pavillons = data;
            },
        });
    }

    loadRooms(pavillonId: string) {
        this.selectedRoom = null;
        this.isRoomLoading = true;
        this._changeDetectorRef.detectChanges();

        this._apiRoomService
            .getRoomsWithReservationsDetails(pavillonId)
            .pipe(
                finalize(() => {
                    this.isRoomLoading = false;
                    this._changeDetectorRef.detectChanges();
                })
            )
            .subscribe({
                next: (data) => {
                    //this.rooms = data;
                    this.rooms = data.map((room) => {
                        const localOccupancy = this.data.existingOccupations.find(occ => occ.roomId === room.id);
                        let updatedRanges = [...(room.reservationsRanges || [])];

                        if (localOccupancy) {
                            updatedRanges.push({
                                start: localOccupancy.rangeOccupation.start,
                                end: localOccupancy.rangeOccupation.end,
                                personsCount: localOccupancy.numberOfPersons,
                                isLocal: true
                            });
                        }
                        const mergedRoom = { ...room, reservationsRanges: updatedRanges };

                        const status = this.getRoomAvailability(mergedRoom);
                        return {
                            ...mergedRoom,
                            isDisabled: status.isDisabled,
                            statusReason: status.reason,
                        };
                    });
                    console.log('rooms', this.rooms);
                },
                error: (err) => {
                    this._toast.error('Erreur lors du chargement des chambres');
                },
            });
    }


    private getRoomAvailability(room: any): RoomStatus {
        if (!room.available) return { isDisabled: true, reason: 'HORS SERVICE' };
        const getTime = (dateInput: any): number => {
            if (!dateInput) return 0;
            // Gestion Luxon/JS Date/String ISO
            if (dateInput.ts) return dateInput.ts;
            if (dateInput instanceof Date) return dateInput.getTime();
            if (typeof dateInput === 'string') return new Date(dateInput.replace(' ', 'T')).getTime();
            return 0;
        };

        const newStart = getTime(this.data.start);
        const newEnd = getTime(this.data.end);

        // DEBUG : Tu devrais maintenant voir de grands nombres ici, pas 0
        console.log('Vérification des Timestamps:', { newStart, newEnd });

        const overlaps = (room.reservationsRanges || []).filter((res) => {
            const resStart = getTime(res.start);
            const resEnd = getTime(res.end);

            // Intersection : (A.start < B.end) && (A.end > B.start)
            return resStart < newEnd && resEnd > newStart;
        });

        if (overlaps.length > 0) {
            if (!room.shared) {
                return { isDisabled: true, reason: 'OCCUPÉE' };
            }

            const currentOccupants = overlaps.reduce((sum, r) => sum + (r.personsCount || 0), 0);
            if (currentOccupants >= room.capacity) {
                return { isDisabled: true, reason: `COMPLÈTE (${currentOccupants}/${room.capacity})` };
            }

            return { isDisabled: false, reason: `PARTAGÉE (${currentOccupants}/${room.capacity} OCCUPÉS)` };
        }

        return { isDisabled: false };
    }

    saveAndClose() {
        console.log(this.selectedRoom);
        this.matDialogRef.close({ room: this.selectedRoom });
    }
}
