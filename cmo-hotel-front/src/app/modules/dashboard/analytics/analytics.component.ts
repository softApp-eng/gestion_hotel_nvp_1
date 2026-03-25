import { DecimalPipe, NgClass } from '@angular/common';
import {
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject } from 'rxjs';
import { AnalyticsService } from './analytics.service';
import { ApiStatisticsService } from '../api.statistics.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'analytics',
    templateUrl: './analytics.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatButtonToggleModule,
        NgApexchartsModule,
        MatTooltipModule,
        MatProgressSpinner,
        NgClass,
        DecimalPipe,
    ],
})
export class AnalyticsComponent implements OnInit, OnDestroy {
    chartVisitors: ApexOptions;
    chartVisitorsVsPageViews: ApexOptions;
    data: any;

    months = [
        'Jan',
        'Fév',
        'Mar',
        'Avr',
        'Mai',
        'Juin',
        'Juil',
        'Août',
        'Sep',
        'Oct',
        'Nov',
        'Déc',
    ];

    currentYear: number = new Date().getFullYear();
    selectedYear: number = this.currentYear;
    selectedYear2: number = this.currentYear;
    percentages = {
        single: 0,
        family: 0,
        delegation: 0,
    };
    counts;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _analyticsService: AnalyticsService,
        private _apiStatisticsService: ApiStatisticsService,
        private _router: Router
    ) {}

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the data
        this.getChartData();
        this.getChart2Data();
        this.getReservationsStatistics();

        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                },
            },
        };
    }

    getReservationsStatistics() {
        this._apiStatisticsService.getReservationsStatistics().subscribe({
            next: (data) => {
                this.counts = data;
                console.log(data);
            },
        });
    }

    navigateYear(offset: number): void {
        const targetYear = this.selectedYear + offset;

        // Sécurité : Ne pas dépasser l'année en cours
        if (targetYear <= this.currentYear) {
            this.selectedYear = targetYear;
            // Charger les nouvelles données pour le graphique
            this.getChartData(this.selectedYear);
        }
    }

    navigateYear2(offset: number): void {
        const targetYear = this.selectedYear2 + offset;

        // Sécurité : Ne pas dépasser l'année en cours
        if (targetYear <= this.currentYear) {
            this.selectedYear2 = targetYear;
            // Charger les nouvelles données pour le graphique
            this.getChart2Data(this.selectedYear2);
        }
    }

    getChartData(year?) {
        this._apiStatisticsService
            .getMonthlyReservations(year)
            .subscribe((data) => {
                this._prepareChartData(data);
            });
    }

    getChart2Data(year?) {
        this._apiStatisticsService
            .getMonthlyReservationsByCategories(year)
            .subscribe((data) => {
                this._prepareChart2Data(data);
                this._calculateStats(data);
            });
    }

    private _calculateStats(monthlyCounts: any): void {
        console.log('Percentages:', this.percentages);
        // On s'assure que monthlyCounts existe et n'est pas une string
        const data = typeof monthlyCounts === 'string' ? JSON.parse(monthlyCounts) : monthlyCounts;

        const sumValues = (obj: any): number => {
            if (!obj || typeof obj !== 'object') return 0;

            // On récupère toutes les valeurs et on s'assure qu'elles sont traitées comme des nombres
            return Object.keys(obj).reduce((acc, key) => {
                const value = Number(obj[key]) || 0;
                return acc + value;
            }, 0);
        };

        const totalSingle = sumValues(data?.single);
        const totalFamily = sumValues(data?.family);
        const totalDelegation = sumValues(data?.delegation);

        const grandTotal = totalSingle + totalFamily + totalDelegation;

        // Réinitialisation
        this.percentages = { single: 0, family: 0, delegation: 0 };

        if (grandTotal > 0) {
            this.percentages.single = Number(((totalSingle / grandTotal) * 100).toFixed(2));
            this.percentages.family = Number(((totalFamily / grandTotal) * 100).toFixed(2));
            this.percentages.delegation = Number(((totalDelegation / grandTotal) * 100).toFixed(2));
        }
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
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter((el) => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute(
                    'fill',
                    `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`
                );
            });
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(monthlyCounts): void {
        const series = Array.from({ length: 12 }, (_, i) => {
            const monthNumber = i + 1;
            // On récupère la valeur si elle existe, sinon 0
            return monthlyCounts[monthNumber] || 0;
        });

        // Visitors
        this.chartVisitors = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false,
                    },
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                width: '100%',
                height: '100%',
                type: 'area',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#818CF8'],
            dataLabels: {
                enabled: false,
            },
            fill: {
                colors: ['#312E81'],
            },
            grid: {
                show: true,
                borderColor: '#334155',
                padding: {
                    top: 10,
                    bottom: 10, // Changé de -40 à 10 pour laisser de la place aux labels
                    left: 20, // Ajout d'un peu de marge à gauche pour les chiffres du YAxis
                    right: 20,
                },
                position: 'back',
            },
            series: [
                {
                    name: 'Total reservations',
                    data: series,
                },
            ],
            stroke: {
                width: 2,
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
                x: {
                    format: 'MMM dd, yyyy',
                },
                y: {
                    formatter: (value: number): string => `${value}`,
                },
            },
            xaxis: {
                type: 'category',
                categories: this.months,
                axisBorder: {
                    show: true, // Activé pour voir la ligne de base
                    color: '#334155',
                },
                axisTicks: {
                    show: true, // Activé pour voir les petits tirets
                    color: '#334155',
                },
                labels: {
                    show: true, // Assurez-vous que c'est bien à true
                    offsetY: 0,
                    style: {
                        colors: '#CBD5E1', // Couleur gris clair pour le mode sombre
                        fontSize: '12px',
                    },
                },
            },
            yaxis: {
                show: true, // CHANGÉ de false à true
                min: 0,
                forceNiceScale: true,
                labels: {
                    style: {
                        colors: '#CBD5E1',
                    },
                    formatter: (value: number): string =>
                        value >= 1000
                            ? (value / 1000).toFixed(0) + 'k'
                            : value.toString(),
                },
            },
        };
    }

    private _prepareChart2Data(monthlyCounts): void {

        const mapDataToYearlyArray = (data: any) => {
            return Array.from({ length: 12 }, (_, i) => {
                const monthNumber = i + 1;
                // On vérifie si le mois (clé) existe dans l'objet, sinon 0
                return data && data[monthNumber] ? data[monthNumber] : 0;
            });
        };

        // Extraction des données pour chaque série
        const dataSingle = mapDataToYearlyArray(monthlyCounts?.single);
        const dataFamily = mapDataToYearlyArray(monthlyCounts?.family);
        const dataDelegation = mapDataToYearlyArray(monthlyCounts?.delegation);

        // Visitors
        this.chartVisitorsVsPageViews = {
            chart: {
                animations: { enabled: true },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area', // 'area' pour l'effet de remplissage élégant
                toolbar: { show: false },
            },
            // Couleurs : Bleu (Single), Indigo (Family), Ambre (Delegation)
            colors: ['#1E293B', '#64748B', '#94A3B8'],
            //colors: ['#3B82F6', '#6366F1', '#F59E0B'],
            dataLabels: { enabled: false },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 0.5,
                    opacityFrom: 0.3,
                    opacityTo: 0.05,
                    stops: [0, 90, 100],
                },
            },
            grid: {
                show: true,
                borderColor: 'rgba(255,255,255,0.05)',
                padding: { top: 10, bottom: 0, left: 10, right: 10 },
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'right',
            },
            series: [
                { name: 'Individuel', data: dataSingle },
                { name: 'Famille', data: dataFamily },
                { name: 'Délégation', data: dataDelegation },
            ],
            stroke: {
                curve: 'smooth',
                width: [3, 2, 2], // On met en avant 'Individuel' avec un trait plus épais
                dashArray: [0, 0, 5], // Optionnel : mettre 'Délégation' en pointillés pour varier
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val) => `${val} réservations`,
                },
            },
            xaxis: {
                type: 'category',
                categories: this.months, // ['Jan', 'Fév', 'Mar', ...]
                labels: {
                    style: { colors: 'var(--fuse-text-secondary)' },
                },
            },
            yaxis: {
                show: false,
                min: 0,
            },
        };
    }
}
