import { Component, OnInit, signal } from '@angular/core';
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
import { FuseAlertComponent, FuseAlertType } from '../../../../@fuse/components/alert';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Toastr } from '../../../core/service/toastr.service';
import { ApiRolesService } from '../api.roles.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { fuseAnimations } from '../../../../@fuse/animations';
import { APP_MODULES } from '../../../core/data/app-modules';
import {MatTooltip} from "@angular/material/tooltip";

@Component({
    selector: 'users-add',
    templateUrl: './role.create.component.html',
    standalone: true,
    animations: fuseAnimations,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        RouterLink,
        FuseAlertComponent,
        MatCheckboxModule,
        MatExpansionModule,
        MatTooltip,
    ],
})
export class RoleCreateComponent implements OnInit {
    form: UntypedFormGroup;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    roleId;
    permissions;
    readonly modules = signal<any[]>([]);
    isSaving: boolean = false;
    private _tempAssignedIds: string[] = [];

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _apiRolesService: ApiRolesService,
        private _router: Router,
        private _toastr: Toastr,
        private _activeRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.loadPermissions();
        this.form = this._formBuilder.group({
            title: ['', [Validators.required]],
            description: [''],
        });
        // initialize form if edit mode
        if (this._router.url.includes('edit')) {
            this.initializeForm();
        }
    }

    loadPermissions() {
        this._apiRolesService.getPermissions().subscribe({
            next: (data) => {
                this.permissions = data;
                const grouped = this.permissions.reduce(
                    (acc, curr) => {
                        const moduleName = curr.module;
                        if (!acc[moduleName]) {
                            acc[moduleName] = {
                                name: moduleName,
                                expandedName: curr.moduleExpandedName,
                                completed: false,
                                subtasks: [],
                            };
                        }
                        acc[moduleName].subtasks.push({
                            ...curr,
                            completed: false,
                        });
                        return acc;
                    },
                    {} as Record<string, any>
                );

                this.modules.set(Object.values(grouped));

                // If we already have assigned IDs from initializeForm, apply them now
                if (this._tempAssignedIds.length > 0) {
                    this.applyAssignedPermissions(this._tempAssignedIds);
                }
            },
        });
    }

    isIndeterminate(module): boolean {
        const anyChecked = module.subtasks.some((s) => s.completed);
        const allChecked = module.subtasks.every((s) => s.completed);
        return anyChecked && !allChecked;
    }

    update(
        moduleIndex: number,
        completed: boolean,
        subtaskIndex?: number
    ): void {
        this.modules.update((modules) => {
            const module = modules[moduleIndex];

            if (subtaskIndex === undefined) {
                // Clicking the Parent: Toggle all children
                module.completed = completed;
                module.subtasks.forEach((t) => (t.completed = completed));
            } else {
                // Clicking a Child: Update parent state based on all children
                module.subtasks[subtaskIndex].completed = completed;
                module.completed = module.subtasks.every((t) => t.completed);
            }
            return [...modules];
        });
    }

    getFinalSelection() {
        return this.modules()
            .flatMap((m) => m.subtasks)
            .filter((s) => s.completed)
            .map((s) => s.id);
    }

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        // Disable the form
        this.form.disable();
        this.isSaving = true;
        const payload = {
            ...this.form.value,
            permissions: this.getFinalSelection(),
        };
        // Hide the alert
        this.showAlert = false;

        if (this.roleId) {
            this._apiRolesService
                .update(payload, this.roleId)
                .pipe(
                    finalize(() => {
                        // Show the alert
                        this.form.enable();
                        window.scroll({
                            top: 0,
                            left: 0,
                            behavior: 'smooth',
                        });
                        this.isSaving = false;
                    })
                )
                .subscribe({
                    next: (value) => {
                        this.alert.type = 'success';
                        this.alert.message = 'Site modifié';
                        this.showAlert = true;
                    },
                    error: (err) => {
                        // Set the alert
                        this.alert.type = 'error';
                        this.alert.message =
                            err?.error?.description ||
                            'Problème de modification de site';
                        this.showAlert = true;
                    },
                });
        } else {
            this._apiRolesService
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
                        this.isSaving = false;
                    })
                )
                .subscribe({
                    next: (value) => {
                        this.alert.type = 'success';
                        this.alert.message = 'Site crée';
                        this.showAlert = true;
                    },
                    error: (err) => {
                        // Set the alert
                        this.alert.type = 'error';
                        this.alert.message =
                            err?.error?.description ||
                            'Problème de création de site';
                        this.showAlert = true;
                    },
                });
        }
    }

    initializeForm() {
        this.form.disable();
        this.roleId = this._activeRoute.snapshot.params['roleId'];
        this._apiRolesService.one(this.roleId).subscribe({
            next: (data: any) => {
                this.form.patchValue({
                    title: data?.title,
                    description: data?.description,
                });
                const assignedIds = data.permissions.map((p) => p.id);

                if (this.modules().length > 0) {
                    this.applyAssignedPermissions(assignedIds);
                } else {
                    this._tempAssignedIds = assignedIds;
                }
                this.form.enable();
            },
            error: (err) => {
                this._toastr.error('error chargement du role');
            },
        });
    }

    applyAssignedPermissions(assignedIds: string[]): void {
        this.modules.update((modules) => {
            modules.forEach((module) => {
                // Check each subtask
                module.subtasks.forEach((subtask) => {
                    if (assignedIds.includes(subtask.id)) {
                        subtask.completed = true;
                    }
                });

                // Update parent "completed" state based on children
                module.completed = module.subtasks.every((s) => s.completed);
            });
            return [...modules];
        });
    }
}
