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

@Component({
    selector: 'rooms-assign-model',
    templateUrl: './assign-rooms.model.html',
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
        public data: {}
    ) {}

    ngOnInit(): void {
        this.loadPavillons();
    }

    loadPavillons() {
        this._apiPavillonService.all().subscribe({
            next: (data) => {
                this.pavillons = data;
                console.log(this.pavillons);
            },
        });
    }

    loadRooms(pavillonId: string) {
        this.selectedRoom = null; // 1. Reset selection when building changes
        this.isRoomLoading = true;
        this._changeDetectorRef.detectChanges();

        this._apiRoomService
            .all(pavillonId)
            .pipe(
                finalize(() => {
                    this.isRoomLoading = false;
                    this._changeDetectorRef.detectChanges();
                })
            )
            .subscribe({
                next: (data) => {
                    this.rooms = data;
                },
                error: (err) => {
                    this._toast.error("Erreur lors du chargement des chambres");
                }
            });
    }

    saveAndClose() {
        console.log(this.selectedRoom);
        this.matDialogRef.close({room : this.selectedRoom});
    }
}
