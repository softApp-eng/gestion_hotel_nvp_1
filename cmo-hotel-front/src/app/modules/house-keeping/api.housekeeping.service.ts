import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiHousekeepingService {

    private readonly API_URL = `${environment.solidarityApi}/v1/house-keeping`;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }


    toggleRoomAvailability(id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.put(`${this.API_URL}/housekeeping/room/availability`, {}, { params });
    }

    updateClean(payload): Observable<any>{
        return this._httpClient.put(`${this.API_URL}/housekeeping/room/clean`, payload);
    }
    listAllAgent(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/agents/all`);
    }

    createAgent(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/agents/create`, payload);
    }

    updateAgent(payload,id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.put(`${this.API_URL}/agents/update`, payload, { params });
    }



    deleteAgent(id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.delete(`${this.API_URL}/agents/delete`, { params });
    }

    search(key='',rooms=[],agents=[],start = '',end = '',anomalie=false, page=0,size=20): Observable<any>{
        let params = new HttpParams()
            .set('key', key)
            .set('start', start)
            .set('end', end)
            .set('page', page)
            .set('size', size)
            .set('anomalie', anomalie);
        if (rooms && rooms.length > 0) {
            rooms.forEach(s => {
                params = params.append('rooms', s);
            });
        }

        if (agents && agents.length > 0) {
            agents.forEach(s => {
                params = params.append('agents', s);
            });
        }
        return this._httpClient.get(`${this.API_URL}/history/search`, { params });
    }

    deleteHistory(id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.delete(`${this.API_URL}/housekeeping/history/delete`, { params });
    }

    updateHistory(id,payload): Observable<any>{
        return this._httpClient.put(`${this.API_URL}/housekeeping/history/update?id=${id}`, payload);
    }

    createPermanence(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/permanence/create`, payload);
    }

    updatePermanence(id,payload): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.put(`${this.API_URL}/permanence/update`, payload, { params });
    }

    deletePermanence(id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.delete(`${this.API_URL}/permanence/delete`, { params });
    }

    listPermanences(start = '', end = ''): Observable<any>{
        let params = new HttpParams();
        if (start) params = params.set('start', start);
        if (end) params = params.set('end', end);
        return this._httpClient.get(`${this.API_URL}/permanence/list`, { params });
    }

}
