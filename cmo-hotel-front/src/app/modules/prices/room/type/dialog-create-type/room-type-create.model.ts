import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { ApiRoomTypeService } from '../api.room-type.service';

@Component({
    selector: 'room-type-create-model',
    templateUrl: './room-type-create.model.html',
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
    ],
})
export class RoomTypeCreateModel implements OnInit {
    title = 'Enregistrer un type de chambre';
    form: UntypedFormGroup;
    type;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<RoomTypeCreateModel>,
        public _apiRoomTypeService: ApiRoomTypeService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { type: any }
    ) {
        this.form = this._formBuilder.group({
            type: ['', [Validators.required]],
            description: [''],
        });
        this.type = data.type;
        console.log('rec data',data);
        if (this.type){
            //initialize
            this.form.patchValue({
                type: this.type.type,
                description: this.type.description
            });
        }

    }

    ngOnInit(): void {}

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        // Disable the form
        this.form.disable();
        let payload = this.form.value;

        if (!this.type){
            // create new pavillon
            this._apiRoomTypeService
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
                        this._toast.success('type crée');
                        this.matDialogRef.close({reload: true});
                    },
                    error: (err) => {
                        this._toast.error(err?.error?.description || 'Problème de creation');
                    },
                });
        } else {
            // update pavillon
            this._apiRoomTypeService
                .update(payload,this.type.id)
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
                        this._toast.success('type modifié');
                        this.matDialogRef.close({reload: true});
                    },
                    error: (err) => {
                        this._toast.error(err?.error?.description || 'Problème de modification');
                    },
                });
        }
    }
}
