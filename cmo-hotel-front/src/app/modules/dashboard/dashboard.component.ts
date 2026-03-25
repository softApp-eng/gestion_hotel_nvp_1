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
        const labels = this.roomsOccupation.map((item) => item.roomType);
        const occupiedData = this.roomsOccupation.map((item) => item.roomOccupied);
        const totalData = this.roomsOccupation.map((item) => Number(item.roomTotal));

        console.log(
            labels,
            occupiedData,
            totalData
        );

        // On définit le maximum absolu du radar sur la plus grande capacité existante
        const maxCapacity = Math.max(...totalData);

        this.chartBudgetDistribution = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'radar',
                toolbar: { show: false }
            },
            // Couleur 1 (Total) : Transparente ou très claire
            // Couleur 2 (Occupied) : Indigo vif pour le radar principal
            colors: ['#E2E8F0', '#6366F1'],
            series: [
                {
                    name: 'Capacité Totale',
                    data: totalData
                },
                {
                    name: 'Occupation Actuelle',
                    data: occupiedData
                }
            ],
            dataLabels: {
                enabled: true,
                formatter: (val: number, { seriesIndex, dataPointIndex, w }): string => {
                    if (seriesIndex === 1) {
                        const series0Data = w.config.series[0].data;
                        const total = series0Data[dataPointIndex];

                        // Vérification stricte du nombre et du diviseur > 0
                        if (typeof val === 'number' && total > 0) {
                            const pct = Math.round((val / total) * 100);
                            return pct > 0 ? `${pct}%` : '';
                        }
                    }
                    return '';
                },
                style: { fontSize: '10px', fontWeight: '700' },
                background: { enabled: true, borderRadius: 4, padding: 4, borderWidth: 0 }
            },
            plotOptions: {
                radar: {
                    size: 140, // Augmentez cette valeur (essayez 140 ou 150)
                    offsetY: 0,
                    polygons: {
                        strokeColors: 'var(--fuse-border)',
                        fill: { colors: ['#F8FAFC', '#FFFFFF'] }
                    }
                }
            },
            stroke: {
                // Trait très fin pour le max (1px), trait marqué pour l'occupation (3px)
                width: [1, 3],
                curve: 'smooth'
            },
            fill: {
                // On rend le fond (Total) presque invisible (0.1) et l'occupation bien visible (0.5)
                opacity: [0.1, 0.5]
            },
            markers: {
                size: [0, 4], // Pas de points sur le cercle total, points sur l'occupation
                strokeWidth: 2
            },
            xaxis: {
                categories: labels,
                labels: {
                    show: true,
                    style: { colors: 'var(--fuse-text-secondary)', fontSize: '11px', fontWeight: 500 }
                }
            },
            yaxis: {
                min: 0,
                max: maxCapacity,
                tickAmount: 5,
                show: false
            },
            tooltip: {
                theme: 'dark',
                y: { formatter: (val: number) => `${val} chambres` }
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


