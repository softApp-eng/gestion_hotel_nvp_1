import  {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigurationService
{
    private readonly API_URL = `${environment.solidarityApi}/v1/administration`;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    updateRoomCleaningCron(time): Observable<any>{
        let params = new HttpParams().set('time', time);
        return this._httpClient.post(`${this.API_URL}/room/clean/cron`, {}, { params });
    }

    updateCheckout(time): Observable<any>{
        let params = new HttpParams().set('time', time);
        return this._httpClient.post(`${this.API_URL}/checkout`, {}, { params });
    }

    loadCurrentConfigs(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/load-config`);
    }

}
