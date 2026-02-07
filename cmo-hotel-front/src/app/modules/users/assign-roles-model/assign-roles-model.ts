import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckbox } from '@angular/material/checkbox';
import { ApiRolesService } from '../../roles/api.roles.service';
import { ApiUsersService } from '../api.users.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'model-roles-assign',
    templateUrl: './assign-roles-model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatCheckbox,
    ],
})
export class AssignRolesModel implements OnInit {

    selectedRoles: string[] = [];
    roles;

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<AssignRolesModel>,
        private _apiRolesService:ApiRolesService,
        private _apiUsersService:ApiUsersService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { user: any }
    ) {
        this.selectedRoles = data.user?.rolesDto?.map(r => r.id);
    }

    ngOnInit(): void {
        this._apiRolesService.getRoles().subscribe(value => {
            this.roles = value;
        })
    }

    toggleModule(r: string, checked: boolean): void {
        if (checked) {
            // Add if not already present
            this.selectedRoles.push(r);
        } else {
            // Remove if unchecked
            this.selectedRoles = this.selectedRoles.filter(m => m !== r);
        }
    }

    isModuleSelected(rid: string): boolean {
        return this.selectedRoles.includes(rid);
    }

    save() {
        // Do nothing if the form is invalid
        if (!this.data.user.userid) {
            return;
        }

        this._apiUsersService
            .assignRoles(this.data.user.userid,this.selectedRoles)
            .subscribe({
                next: (value) => {
                    this._toast.success('roles changés"');
                    this.matDialogRef.close({reload: true});
                },
                error: (err) => {
                    this._toast.error(err?.error?.description || 'Problème de modification');
                },
            });
    }
}
