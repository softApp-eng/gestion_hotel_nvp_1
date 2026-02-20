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
import { UserService } from '../../../core/user/user.service';
import { User } from '../../../core/user/user.types';

@Component({
    selector: 'settings-account',
    templateUrl: './account.component.html',
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
export class SettingsAccountComponent implements OnInit {
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
        private _user: UserService,
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
            firstName: ['', [Validators.required, Validators.maxLength(254)]],
            lastName: ['', [Validators.required, Validators.maxLength(254)]],
        });
        this.loadProfile();
    }

    loadProfile() {
        this._user.user$.subscribe((user: User) => {
            console.log(user);
            this.profile = user;
            this.form.patchValue({
                firstName: this.profile.firstName,
                lastName: this.profile.lastName,
            })
        })
    }

    update() {
        // Do nothing if the form is invalid
        if (this.form.invalid) return;

        // Disable the form
        this.form.disable();
        this.saving = true;

        this._apiRolesService
            .updateProfile(this.form.value)
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
                    this._toastr.success('Profile modifié');
                    this._user.get().subscribe();
                },
                error: (err) => {
                    this._toastr.error(err?.error?.description || 'error');
                },
            });
    }
}
