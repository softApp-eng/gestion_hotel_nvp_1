import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { KeyValuePipe, NgClass, SlicePipe, TitleCasePipe } from '@angular/common';
import { ApiPavillonService } from '../api.pavillon.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HasPermissionDirective } from '../../../core/auth/HasPermissionDirective';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { MatDrawer, MatDrawerContainer, MatSidenavModule } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '../../../../@fuse/services/media-watcher';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserUpdateMdpModel } from '../../users/update-mdp-model/user.update-mdp.model';
import { PavillonCreateModel } from '../create/pavillon-create.model';

@Component({
    selector: 'pavillon-list',
    templateUrl: './pavillon.list.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        MatSidenavModule,
        MatIconModule,
        FormsModule,
        MatTabsModule,
        RouterLink,
        HasPermissionDirective,
        KeyValuePipe,
        TitleCasePipe
    ],
})
export class PavillonListComponent implements OnInit {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;

    pavillons = [];
    /*
     Long id,
        String name,
        String email,
        String phoneNumber,
        Integer starsNumber,
        String description
     */
    /**
     * Constructor
     */
    constructor(
        private _apiPavillonService: ApiPavillonService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.loadPavillons();
    }

    loadPavillons() {
        this._apiPavillonService.all().subscribe({
            next: (data) => {
                this.pavillons = data;
                console.log('pavillons loaded', data);
            },
        });
    }

    raiseSavePavillon(pavillon) {
        this._matDialog
            .open(PavillonCreateModel, {
                data: { pavillon: pavillon },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((data) => {
                if (data?.reload) {
                    this.loadPavillons();
                }
            });
    }
}
