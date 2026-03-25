import { CurrencyPipe, DatePipe, KeyValuePipe } from '@angular/common';
import {
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { ApiStatisticsService } from '../api.statistics.service';

@Component({
    selector: 'finance',
    templateUrl: './finance.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        CurrencyPipe,
        DatePipe,
        KeyValuePipe,
    ],
})
export class FinanceComponent implements OnInit {
    counts;
    today = new Date();

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    roomRevenues = [];
    private roomRevenuesTotal = 0;

    /**
     * Constructor
     */
    constructor(
        private _apiStatisticsService: ApiStatisticsService
    ) {}

    /**
     * On init
     */
    ngOnInit(): void {
        this.getFinancialStatistics();
        this.getRoomTypeRevenue();
    }

    calculatePercentage(value: number): string {
        if (this.roomRevenuesTotal === 0) {
            return '0';
        }
        const percentage = (value / this.roomRevenuesTotal) * 100;
        return percentage.toFixed(1);
    }

    getFinancialStatistics() {
        this._apiStatisticsService.getFinancialStatistics().subscribe({
            next: (data) => {
                this.counts = data;
                console.log(data);
            },
        });
    }

    getRoomTypeRevenue() {
        this._apiStatisticsService.getRoomTypeRevenue().subscribe({
            next: (data) => {
                this.roomRevenues = data;
                const values = Object.values(this.roomRevenues);
                this.roomRevenuesTotal = values.reduce((acc, curr) => acc + (curr as number), 0);
            },
        });
    }

}
