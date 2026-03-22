import {
    CurrencyPipe,
    NgClass,
} from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, NativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { ApiCommonService } from '../../../core/service/api.common.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ApiStatisticsService } from '../api.statistics.service';

@Component({
    selector: 'crypto',
    templateUrl: './dashboard.finance.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatIconModule,
        NgClass,
        NgApexchartsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        CurrencyPipe,
        MatDatepickerModule,
        NativeDateModule,
    ],
})
export class DashboardFinanceComponent implements OnInit, OnDestroy {

    btcOptions: ApexOptions = {};
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    watchlistChartOptions: ApexOptions = {};
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    paymentModes = [];
    categories = [];
    maxYear = new Date().getFullYear();
    filters = {
        paymentModes: [],
        categories: [],
        year: new Date().getFullYear()
    };
    counts;
    months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    /**
     * Constructor
     */
    constructor(
        private _apiCommonService: ApiCommonService,
        private _apiStatisticsService: ApiStatisticsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    /**
     * On init
     */
    ngOnInit(): void {
        this.getFinancialStatistics();
        this.loadPaymentMode();
        this.loadReservationCategory();
        this.getChartData();
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened if 'lg' breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    getChartData(){
        this._apiStatisticsService.getMonthlyRevenueMap(
            this.filters.year,
            this.filters.paymentModes,
            this.filters.categories,

        ).subscribe((data) => {
                this._prepareChartData(data);
            });
    }

    getFinancialStatistics() {
        this._apiStatisticsService.getFinancialStatistics().subscribe({
            next: (data) => {
                this.counts = data;
            },
        });
    }

    loadPaymentMode() {
        this._apiCommonService.getEnumsData('payment-mode').subscribe({
            next: (data) => {
                this.paymentModes = data;
            },
        });
    }

    loadReservationCategory() {
        this._apiCommonService
            .getEnumsData('reservation-categories')
            .subscribe({
                next: (data) => {
                    this.categories = data;
                },
            });
    }

    changeYear(offset: number): void {
        const newYear = this.filters.year + offset;

        // On empêche d'aller au-delà de l'année actuelle
        if (newYear <= this.maxYear) {
            this.filters.year = newYear;
        }
        this.getChartData();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(monthlyRevenue:any): void {

        const series = Array.from({ length: 12 }, (_, i) => {
            const monthNumber = i + 1;
            // On récupère la valeur si elle existe, sinon 0
            return monthlyRevenue[monthNumber] || 0;
        });

        this.btcOptions = {
            chart: {
                animations: {
                    enabled: true,         // <--- Changez à true
                    easing: 'easeinout',   // Effet de transition fluide
                    speed: 600,            // Durée de l'animation en ms
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,     // <--- Crucial pour l'effet lors du changement de data
                        speed: 350         // Vitesse de la transition entre deux jeux de données
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                width: '100%',
                height: '100%',
                type: 'line',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#5A67D8'],
            dataLabels: {
                enabled: false,
            },
            grid: {
                borderColor: 'var(--fuse-border)',
                position: 'back',
                show: true,
                strokeDashArray: 6,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            legend: {
                show: false,
            },
            //series: this.data.btc.price.series,
            series: [
                {
                    name: 'Chiffre d\'Affaires',
                    data: series
                }
            ],
            stroke: {
                width: 3,
                curve: 'smooth',
            },
            tooltip: {
                shared: true,
                theme: 'dark',
                y: {
                    formatter: (value: number): string =>
                        value.toFixed(2) + ' DHS',
                },
            },
            xaxis: {
                type: 'category',
                categories: this.months,
                crosshairs: {
                    show: true,
                    position: 'back',
                    fill: {
                        type: 'color',
                        color: 'var(--fuse-border)',
                    },
                    width: 3,
                    stroke: {
                        dashArray: 0,
                        width: 0,
                    },
                    opacity: 0.9,
                },
                tickAmount: 8,
                axisTicks: {
                    show: true,
                    color: 'var(--fuse-border)',
                },
                axisBorder: {
                    show: false,
                },
                tooltip: {
                    enabled: false,
                },
                labels: {
                    show: true,
                    trim: false,
                    rotate: 0,
                    minHeight: 40,
                    hideOverlappingLabels: true,
                    style: {
                        colors: 'currentColor',
                    },
                },
            },
            yaxis: {
                axisTicks: {
                    show: true,
                    color: 'var(--fuse-border)',
                },
                axisBorder: {
                    show: false,
                },
                forceNiceScale: true,
                labels: {
                    minWidth: 40,
                    formatter: (value: number): string =>
                        value >= 1000 ? (value / 1000).toFixed(0) + 'k Dhs' : value + ' Dhs',
                    style: {
                        colors: 'currentColor',
                    },
                },
            },
        };

        // Watchlist options
        this.watchlistChartOptions = {
            chart: {
                animations: {
                    enabled: false,
                },
                width: '100%',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#A0AEC0'],
            stroke: {
                width: 2,
                curve: 'smooth',
            },
            tooltip: {
                enabled: false,
            },
            xaxis: {
                type: 'category',
            },
        };
    }
}
