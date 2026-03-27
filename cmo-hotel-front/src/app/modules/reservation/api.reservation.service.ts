import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiReservationService {

    private readonly API_URL = `${environment.solidarityApi}/v1/reservations`;

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }

    search(key='',reservationCode='',status=[],categories=[],start = '',end = '',page=0,size=20): Observable<any>{
        let params = new HttpParams()
            .set('key', key)
            .set('reservationCode', reservationCode)
            .set('start', start)
            .set('end', end)
            .set('page', page)
            .set('size', size);
        if (status && status.length > 0) {
            status.forEach(s => {
                params = params.append('status', s);
            });
        }
        if (categories && categories.length > 0) {
            categories.forEach(s => {
                params = params.append('categories', s);
            });
        }
        return this._httpClient.get(`${this.API_URL}/search`, { params });
    }

    getRangReservations(type:'reservations' | 'rooms'='reservations',start,end): Observable<any>{
        let params = new HttpParams()
            .set('start', start)
            .set('end', end);
        return this._httpClient.get(`${this.API_URL}/planning/${type}`, { params });
    }

    getSejours(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/sejours`);
    }

    getResidentReservations(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/residents`);
    }

    getReservation(code): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/one?code=${code}`);
    }

    create(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/create`, payload);
    }

    update(payload,code): Observable<any>{
        return this._httpClient.put(`${this.API_URL}/update?code=${code}`, payload);
    }

    acceptReservation(code,checkin): Observable<any>{
        return this._httpClient.put(`${this.API_URL}/accept?code=${code}&checkin=${checkin}`, {});
    }

    switchRoom(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/switch-room`, payload);
    }

    removeRoomSwitch(reservationId,switchedRoomId): Observable<any>{
        return this._httpClient.delete(`${this.API_URL}/switch-room?reservationId=${reservationId}&switchedRoomId=${switchedRoomId}`, {});
    }

    closeReservation(code,checkout): Observable<any>{
        return this._httpClient.put(`${this.API_URL}/close?code=${code}&checkout=${checkout}`, {});
    }

    cancelReservation(code): Observable<any>{
        return this._httpClient.put(`${this.API_URL}/cancel?code=${code}`,{});
    }

    extendReservation(code, date): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/time/extend?code=${code}&date=${date}`,{});
    }

    deleteReservation(code): Observable<any>{
        let params = new HttpParams()
            .set('code', code);
        return this._httpClient.delete(`${this.API_URL}/delete`, { params });
    }

    downloadInvoice(code): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/invoice?code=${code}`, {
            responseType: 'blob'
        });
    }

}
