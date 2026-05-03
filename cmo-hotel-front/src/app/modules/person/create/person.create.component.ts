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
import { finalize, map, Observable, startWith } from 'rxjs';
import { FuseAlertComponent, FuseAlertType } from '../../../../@fuse/components/alert';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiPersonService } from '../api.person.service';
import { Toastr } from '../../../core/service/toastr.service';
import { fuseAnimations } from '../../../../@fuse/animations';
import { ApiCommonService } from '../../../core/service/api.common.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UtilsService } from '../../../core/service/utils.service';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { AppConstantValues } from '../../../core/data/app-constant-values';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'person-add',
    templateUrl: './person.create.component.html',
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
        MatSlideToggleModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        AsyncPipe,
    ],
})
export class PersonCreateComponent implements OnInit {
    form: UntypedFormGroup;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    personId;
    grades;
    pays: string[] = AppConstantValues.PAYS;
    filteredPays: Observable<string[]>;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _apiPersonService: ApiPersonService,
        private _apiCommonService: ApiCommonService,
        private _utilsService: UtilsService,
        private _router: Router,
        private _toastr: Toastr,
        private _activeRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.loadGrades();
        this.form = this._formBuilder.group({
            gradeId: ['', [Validators.required]],
            identity: [''],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            gender: [''],
            email: [''],
            birthDate: [''],
            phoneNumber: [''],
            nationality: ['Maroc'],
            language: [''],
            matricule: [''],
            unite: [''],
            observation: [''],
        });
        // initialize form if edit mode
        if (this._router.url.includes('edit')) {
            this.initializeForm();
        }
        this.filteredPays = this.form.get('nationality').valueChanges.pipe(
            startWith(''),
            map((value) => this._filter(value || ''))
        );
    }
    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.pays.filter((p) => p.toLowerCase().includes(filterValue));
    }

    validateNationality(): void {
        setTimeout(() => { // Un léger délai permet à l'autocomplete de finir sa sélection
            const value = this.form.get('nationality').value;
            if (value && !this.pays.includes(value)) {
                this.form.get('nationality').setValue('');
            }
        }, 200);
    }

    loadGrades() {
        this._apiCommonService.grades().subscribe({
            next: (data) => {
                this.grades = data;
                console.log('grades', this.grades);
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

        // Hide the alert
        this.showAlert = false;

        let payload = this.form.value;
        if (payload.birthDate) {
            payload.birthDate = this._utilsService.convertToDate(
                payload.birthDate
            );
        }

        if (this.personId) {
            this._apiPersonService
                .update(payload, this.personId)
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
                        this.alert.message = 'client modifié';
                        this.showAlert = true;
                    },
                    error: (err) => {
                        // Set the alert
                        this.alert.type = 'error';
                        this.alert.message =
                            err?.error?.description ||
                            'Problème de modification de client';
                        this.showAlert = true;
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
                        this.alert.type = 'success';
                        this.alert.message = 'client crée';
                        this.showAlert = true;
                    },
                    error: (err) => {
                        // Set the alert
                        this.alert.type = 'error';
                        this.alert.message =
                            err?.error?.description ||
                            'Problème de création de client';
                        this.showAlert = true;
                    },
                });
        }
    }

    initializeForm() {
        this.form.disable();
        this.personId = this._activeRoute.snapshot.params['personId'];
        this._apiPersonService.one(this.personId).subscribe({
            next: (data: any) => {
                console.log(data);
                this.form.patchValue({
                    gradeId: data?.grade.id,
                    identity: data?.identity,
                    firstName: data?.firstName,
                    lastName: data?.lastName,
                    gender: data?.gender,
                    email: data?.email,
                    birthDate: data?.birthDate ? new Date(data?.birthDate) : '',
                    phoneNumber: data?.phoneNumber,
                    nationality: data?.nationality,
                    language: data?.language,
                    matricule: data?.matricule,
                    unite: data?.unite,
                    observation: data?.observation,
                });
                this.form.enable();
            },
            error: (err) => {
                this._toastr.error('error chargement du client');
            },
        });
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
