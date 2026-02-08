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
import { ApiRoomPriceService } from '../api.room-price.service';

@Component({
    selector: 'room-type-create-model',
    templateUrl: './room-price-create.model.html',
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
export class RoomPriceCreateModel implements OnInit {
    title = 'Enregistrer un nouveau prix';
    form: UntypedFormGroup;
    price;
    type;
    categories = [
        'OFFICIER_SUPERIEUR',
        'OFFICIER_SUBALTERNE',
        'CIVIL'
    ];

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<RoomPriceCreateModel>,
        public _apiRoomPriceService: ApiRoomPriceService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { price: any ,type: any }
    ) {
        this.form = this._formBuilder.group({
            roomTypeId: ['', [Validators.required]],
            category: ['', [Validators.required]],
            price: ['', [Validators.required]],
        });
        this.price = data.price;
        this.type = data.type;
        this.form.patchValue({ roomTypeId: this.type.id });
        console.log('data', this.data);
        if (this.price){
            //initialize
            this.form.patchValue({
                category: this.price.category,
                price: this.price.price
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

        if (!this.price){
            // create new pavillon
            this._apiRoomPriceService
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
                        this._toast.success('Prix crée');
                        this.matDialogRef.close({reload: true});
                    },
                    error: (err) => {
                        this._toast.error(err?.error?.description || 'Problème de creation');
                    },
                });
        } else {
            // update pavillon
            this._apiRoomPriceService
                .update(payload,this.price.id)
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
                        this._toast.success('Prix modifié');
                        this.matDialogRef.close({reload: true});
                    },
                    error: (err) => {
                        this._toast.error(err?.error?.description || 'Problème de modification');
                    },
                });
        }
    }
}
