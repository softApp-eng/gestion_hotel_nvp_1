import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { ApiUsersService } from '../api.users.service';
import { NgClass } from '@angular/common';
import { UserUpdateModel } from '../update-model/user-update';
import { UserUpdateMdpModel } from '../update-mdp-model/user.update-mdp.model';
import { AssignRolesModel } from '../assign-roles-model/assign-roles-model';
import { HasPermissionDirective } from '../../../core/auth/HasPermissionDirective';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';

@Component({
    selector: 'users-list',
    templateUrl: './user.list.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        HighlightPipe,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        NgClass,
        RouterLink,
        HasPermissionDirective,
    ],
})
export class UserListComponent implements OnInit {
    users;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'username',
        'fullName',
        'roles',
        'status',
        'action',
    ];
    dataSource = new MatTableDataSource<any>([]);
    key = '';

    /**
     * Constructor
     */
    constructor(
        private _aApiUsersService: ApiUsersService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this._aApiUsersService
            .getUsers()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.users = value;
                    this.dataSource.data = this.users;
                    console.log(this.users);
                },
            });
    }

    search(key: string) {
        this.key = key;
        this.dataSource.data = this.users?.filter(
            (r) =>
                r?.username?.toLowerCase()?.includes(key?.toLowerCase()) ||
                r?.firstName?.toLowerCase()?.includes(key?.toLowerCase()) ||
                r?.lastName?.toLowerCase()?.includes(key?.toLowerCase())
        );
    }

    raiseUpdateUserModel(user) {
        this._matDialog
            .open(UserUpdateModel, { data: { user: user } })
            .afterClosed()
            .subscribe((updatedUser) => {
                if (!updatedUser) return;

                this.users = this.users.map((u) =>
                    u.userid === updatedUser.userid
                        ? { ...u, ...updatedUser }
                        : u
                );

                this.dataSource.data = this.users;
            });
    }

    raisePasswordChangeModel(user) {
        this._matDialog
            .open(UserUpdateMdpModel, { data: { user: user } })
            .afterClosed()
            .subscribe();
    }

    raiseRolesAssignModel(user) {
        this._matDialog
            .open(AssignRolesModel, { data: { user: user } })
            .afterClosed()
            .subscribe((value) => {
                if (value?.reload) {
                    this.loadUsers();
                }
            });
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
