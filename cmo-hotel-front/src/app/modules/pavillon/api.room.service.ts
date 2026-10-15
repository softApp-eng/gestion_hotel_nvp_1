import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiRoomService {

    private readonly API_URL = `${environment.solidarityApi}/v1/rooms`;

    /**
    * Constructor
    */
    constructor(private _httpClient: HttpClient)
    {
    }

    create(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/create`, payload);
    }

    update(payload,id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.put(`${this.API_URL}/update`, payload, { params });
    }

    all(pavillonId = null,clean:boolean=null): Observable<any>{
        let params = new HttpParams()
            .set('pavillonId', pavillonId == null?'':pavillonId)
            .set('clean', clean == null?'':clean);
        return this._httpClient.get(`${this.API_URL}/all`, { params });
    }

    getRoomsWithReservationsDetails(pavillonId = null): Observable<any>{
        let params = new HttpParams()
            .set('pavillonId', pavillonId == null?'':pavillonId);
        return this._httpClient.get(`${this.API_URL}/all/details`, { params });
    }

    grantedRooms(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/granted`);
    }

    one(id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.get(`${this.API_URL}/one`, { params });
    }

    delete(id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.delete(`${this.API_URL}/delete`, { params });
    }

}
