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
import { ApiPavillonService } from '../api.pavillon.service';

@Component({
    selector: 'user-update',
    templateUrl: './pavillon-create.model.html',
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
export class PavillonCreateModel implements OnInit {
    title = 'Enregistrer un pavillon';
    form: UntypedFormGroup;
    pavillon;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<PavillonCreateModel>,
        public _apiPavillonService: ApiPavillonService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { pavillon: any }
    ) {
        this.form = this._formBuilder.group({
            name: ['', [Validators.required]],
            email: [''],
            starsNumber: ['', [Validators.required]],
            phoneNumber: [''],
            description: [''],
        });
        this.pavillon = data.pavillon;
        if (this.pavillon){
            //initialize
            this.form.patchValue({
                name: this.pavillon.name,
                email: this.pavillon.email,
                starsNumber: this.pavillon.starsNumber,
                phoneNumber: this.pavillon.phoneNumber,
                description: this.pavillon.description
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

        if (!this.pavillon){
            // create new pavillon
            this._apiPavillonService
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
                        this._toast.success('Pavillon crée');
                        this.matDialogRef.close({reload: true});
                    },
                    error: (err) => {
                        this._toast.error(err?.error?.description || 'Problème de creation');
                    },
                });
        } else {
            // update pavillon
            this._apiPavillonService
                .update(payload,this.pavillon.id)
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
                        this._toast.success('Pavillon modifié');
                        this.matDialogRef.close({reload: true});
                    },
                    error: (err) => {
                        this._toast.error(err?.error?.description || 'Problème de modification');
                    },
                });
        }


    }
}
