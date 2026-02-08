import { Component, OnInit } from '@angular/core';
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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiPavillonService } from '../../api.pavillon.service';
import { ApiRoomService } from '../../api.room.service';
import { Toastr } from '../../../../core/service/toastr.service';
import { FuseAlertComponent, FuseAlertType } from '../../../../../@fuse/components/alert';
import { fuseAnimations } from '../../../../../@fuse/animations';
import { ApiRoomTypeService } from '../../../prices/room/type/api.room-type.service';

@Component({
    selector: 'room-add',
    templateUrl: './room.create.component.html',
    standalone: true,
    animations: fuseAnimations,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatSelectModule,
        RouterLink,
        FuseAlertComponent,
        MatSlideToggleModule
    ],
})
export class RoomCreateComponent implements OnInit {
    form: UntypedFormGroup;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    pavillon;
    roomId;
    roomTypes = [];

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _apiRoomService: ApiRoomService,
        private _router: Router,
        private _toastr: Toastr,
        private _activeRoute: ActivatedRoute,
        private _apiPavillonService: ApiPavillonService,
        private _apiRoomTypeService: ApiRoomTypeService,

    ) {
        this.loadCurrentPavillon();
        this.loadTypes();
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group(
            {
                roomTypeId: ['', [Validators.required]],
                code: ['', [Validators.required]],
                name: ['', [Validators.required]],
                capacity: ['', [Validators.required]],
                floor: [''],
                description: [''],
            }
        );
        // initialize form if edit mode
        if (this._router.url.includes('edit')) {
            this.initializeForm();
        }
    }

    loadCurrentPavillon(){
        const pavillonId = this._activeRoute.snapshot.params['pavillonId'];
        this._apiPavillonService.one(pavillonId).subscribe({
            next: data => {
                this.pavillon = data;
                console.log("pavillon", this.pavillon);
            }
        })
    }

    loadTypes(){
        this._apiRoomTypeService.all().subscribe({
            next: data => {
                this.roomTypes = data;
            }
        })
    }

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        if (!this.pavillon?.id) {
            this._toastr.error('Pavillon non selectioné!');
            return;
        }

        // Disable the form
        this.form.disable();

        // Hide the alert
        this.showAlert = false;

        let payload = { ...this.form.value, pavillonId: this.pavillon?.id};

        if (this.roomId) {
            this._apiRoomService
                .update(payload,this.roomId)
                .pipe(
                    finalize(() => {
                        // Show the alert
                        this.form.enable();
                        window.scroll({
                            top: 0,
                            left: 0,
                            behavior: 'smooth',
                        });
                    })
                )
                .subscribe({
                    next: (value) => {
                        this.alert.type = 'success';
                        this.alert.message = 'chambre modifiée';
                        this.showAlert = true;
                    },
                    error: (err) => {
                        // Set the alert
                        this.alert.type = 'error';
                        this.alert.message =
                            err?.error?.description ||
                            'Problème de modification de chambre';
                        this.showAlert = true;
                    },
                });
        } else {
            this._apiRoomService
                .create(payload)
                .pipe(
                    finalize(() => {
                        // Show the alert
                        this.form.enable();
                        window.scroll({
                            top: 0,
                            left: 0,
                            behavior: 'smooth',
                        });
                    })
                )
                .subscribe({
                    next: (value) => {
                        this.alert.type = 'success';
                        this.alert.message = 'chambre crée';
                        this.showAlert = true;
                    },
                    error: (err) => {
                        // Set the alert
                        this.alert.type = 'error';
                        this.alert.message =
                            err?.error?.description ||
                            'Problème de création de chambre';
                        this.showAlert = true;
                    },
                });
        }


    }

    initializeForm() {
        this.form.disable();
        this.roomId = this._activeRoute.snapshot.params['roomId'];
        this._apiRoomService.one(this.roomId).subscribe({
            next: (data: any) => {
                this.form.patchValue({
                    //pavillonId: data?.name,
                    roomTypeId: data?.roomType?.id,
                    code: data?.code,
                    name: data?.name,
                    capacity: data?.capacity,
                    floor: data?.floor,
                    description: data?.description,
                });

                this.form.enable();
            },
            error: (err) => {
                this._toastr.error("error chargement de la chambre");
            },
        });
    }
}
