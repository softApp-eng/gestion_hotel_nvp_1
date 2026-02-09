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
import { ApiPersonService } from '../../person/api.person.service';
import { UtilsService } from '../../../core/service/utils.service';
import { ApiCommonService } from '../../../core/service/api.common.service';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { RouterLink } from '@angular/router';
import { FuseAlertComponent } from '../../../../@fuse/components/alert';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
    selector: 'person-add-model',
    templateUrl: './person-create.model.html',
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
        MatSlideToggleModule,
        MatDatepickerModule
    ],
})
export class PersonCreateModel implements OnInit {
    title = 'Enregistrer une personne';
    form: UntypedFormGroup;
    person;
    grades;
    relationTypes = [
        'WIFE',
        'SON',
        'FATHER',
        'MATHER',
    ]

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<PersonCreateModel>,
        private _apiPersonService: ApiPersonService,
        private _utilsService: UtilsService,
        private _apiCommonService: ApiCommonService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { person: any, isFamille:boolean }
    ) {
        this.form = this._formBuilder.group({
            gradeId: ['', [Validators.required]],
            primaryPersonId: [''],
            relationshipType: [''],
            identity: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            gender: [''],
            email: [''],
            birthDate: [''],
            phoneNumber: [''],
            nationality: [''],
            language: [''],
            matricule: [''],
            unite: [''],
            observation: [''],
        });
        this.person = data.person;
        console.log('AIT',data);
        if(data.isFamille){
            this.form.patchValue({
                primaryPersonId: this.person.id
            })
        }
        if (this.person && !data.isFamille) {
            //initialize
            this.form.patchValue({
                gradeId: this.person?.grade?.id,
                primaryPersonId: this.person?.primaryPersonId || '',
                relationshipType: this.person?.relationshipType || '',
                identity: this.person?.identity,
                firstName: this.person?.firstName,
                lastName: this.person?.lastName,
                gender: this.person?.gender,
                email: this.person?.email,
                birthDate: this.person?.birthDate ? new Date(this.person?.birthDate) : '',
                phoneNumber: this.person?.phoneNumber,
                nationality: this.person?.nationality,
                language: this.person?.language,
                matricule: this.person?.matricule,
                unite: this.person?.unite,
                observation: this.person?.observation,
            });
        }
    }

    ngOnInit(): void {
        this.loadGrades();
    }

    loadGrades() {
        this._apiCommonService.grades().subscribe({
            next: (data) => {
                this.grades = data;
            },
        });
    }

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        // Disable the form
        this.form.disable();

        let payload = this.form.value;
        if (payload.birthDate) {
            payload.birthDate = this._utilsService.convertToDate(
                payload.birthDate
            );
        }

        if (this.person && !this.data.isFamille) {
            this._apiPersonService
                .update(payload, this.person.id)
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
                        this._toast.success('client modifié');
                        this.matDialogRef.close({status : 'update',data:value});
                    },
                    error: (err) => {
                        this._toast.error(
                            err?.error?.description ||
                                'Problème de modification de client'
                        );
                    },
                });
        } else {
            this._apiPersonService
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
                        this._toast.success('client ajouté');
                        this.matDialogRef.close({status : 'create',data:value});
                    },
                    error: (err) => {
                        this._toast.error(
                            err?.error?.description ||
                                'Problème de création de client'
                        );
                    },
                });
        }
    }
}
