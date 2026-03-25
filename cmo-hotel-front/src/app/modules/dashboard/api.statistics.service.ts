import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiStatisticsService {

    private readonly API_URL = `${environment.solidarityApi}/v1/statistics`;

    /**
    * Constructor
    */
    constructor(private _httpClient: HttpClient)
    {
    }

    getFinancialStatistics(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/finance/counts`);
    }

    getReservationsStatistics(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/reservations/counts`);
    }
    getReservationsCurrentState(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/reservations/current/counts`);
    }

    getRoomTypeOccupationStatistics(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/reservations/rooms/occupation`);
    }

    getMonthlyRevenueMap(year?,paymentModes=[], categories=[]): Observable<any>{
        let params = new HttpParams()
            .set('year', year);
        if (paymentModes && paymentModes.length > 0) {
            paymentModes.forEach(s => {
                params = params.append('paymentModes', s);
            });
        }
        if (categories && categories.length > 0) {
            categories.forEach(s => {
                params = params.append('categories', s);
            });
        }
        return this._httpClient.get(`${this.API_URL}/finance/monthly/revenue`, { params });
    }

    getRoomTypeRevenue(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/finance/room-types/revenue`);
    }


    getMonthlyReservations(year?): Observable<any>{
        let params = new HttpParams()
            .set('year', year ? year : new Date().getFullYear());
        return this._httpClient.get(`${this.API_URL}/reservation/monthly/counts`, { params });
    }

    getMonthlyReservationsByCategories(year?): Observable<any>{
        let params = new HttpParams()
            .set('year', year ? year : new Date().getFullYear());
        return this._httpClient.get(`${this.API_URL}/reservation/category/monthly/counts`, { params });
    }

}
