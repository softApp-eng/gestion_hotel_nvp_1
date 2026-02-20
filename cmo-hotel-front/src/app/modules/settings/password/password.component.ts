import { TextFieldModule } from '@angular/cdk/text-field';
import {
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { Toastr } from '../../../core/service/toastr.service';
import { ApiRolesService } from '../api.profile.service';

@Component({
    selector: 'settings-password',
    templateUrl: './password.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
    ],
})
export class SettingsPasswordComponent implements OnInit {
    form: UntypedFormGroup;
    profile;
    saving: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _toastr: Toastr,
        private _apiRolesService: ApiRolesService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.form = this._formBuilder.group({
            currentPassword: ['', [Validators.required, Validators.maxLength(254)]],
            newPassword: ['', [Validators.required, Validators.maxLength(254)]],
        });
    }

    update() {
        // Do nothing if the form is invalid
        if (this.form.invalid) return;

        // Disable the form
        this.form.disable();
        this.saving = true;

        this._apiRolesService
            .changePassword(this.form.value)
            .pipe(
                finalize(() => {
                    // Show the alert
                    this.form.enable();
                    this.saving = false;
                    window.scroll({
                        top: 0,
                        left: 0,
                        behavior: 'smooth',
                    });
                })
            )
            .subscribe({
                next: () => {
                    this._toastr.success('Mot de passe modifié');
                },
                error: (err) => {
                    this._toastr.error(err?.error?.description || 'error');
                },
            });
    }
}
