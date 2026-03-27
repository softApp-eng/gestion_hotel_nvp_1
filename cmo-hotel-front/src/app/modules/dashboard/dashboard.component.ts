import {
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { User } from '../../core/user/user.types';
import { UserService } from '../../core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiStatisticsService } from './api.statistics.service';
import { NgClass, PercentPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'admin-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatIcon,
        NgApexchartsModule,
        MatButtonToggleModule,
        MatIcon,
        NgApexchartsModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatTooltipModule,
        FormsModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        PercentPipe,
        NgClass,
        MatProgressSpinner,
    ],
})
export class DashboardComponent implements OnDestroy, OnInit {
    user: User;
    counts;
    roomsOccupation = [];
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _userService: UserService,
        private _apiStatisticsService: ApiStatisticsService
    ) {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });
    }
    ngOnInit(): void {
        this._apiStatisticsService.getReservationsCurrentState().subscribe({
            next: (data) => {
                this.counts = data;
            },
        });

        this._apiStatisticsService.getRoomTypeOccupationStatistics().subscribe({
            next: (data) => {
                this.roomsOccupation = data;
                this.updateChartData();
                console.log(data);
            },
        });
    }

    private updateChartData(): void {
        if (!this.roomsOccupation?.length) return;

        const labels = this.roomsOccupation.map(item => item.roomType);
        const occupied = this.roomsOccupation.map(item => item.roomOccupied);
        const available = this.roomsOccupation.map(item => Number(item.roomTotal) - item.roomOccupied);

        this.chartBudgetDistribution = {
            series: [
                { name: 'Occupées', data: occupied },
                { name: 'Disponibles', data: available }
            ],
            chart: {
                type: 'bar',
                height: 350,
                stacked: true,
                stackType: '100%',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '60%',
                    borderRadius: 4
                }
            },
            xaxis: {
                // Dans un bar horizontal, les catégories vont ici pour l'axe Y
                categories: labels,
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                        fontWeight: 500
                    }
                }
            },
            // Ajout d'une configuration yaxis pour s'assurer que les noms ne sont pas coupés
            yaxis: {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                        fontWeight: 500
                    }
                }
            },
            colors: ['#6366F1', '#E2E8F0'],
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val) => `${val} chambres`
                }
            },
            grid: {
                show: false
            }
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}


