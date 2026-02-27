import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiRestaurationService {

    private readonly API_URL = `${environment.solidarityApi}/v1/restauration`;

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }


    getMealPrice(mealType: string, personId: string) {
        return this._httpClient.get<number>(
            `${this.API_URL}/meal-price?mealType=${mealType}&personId=${personId}`
        );
    }
    createPrestation(data: any) {
        return this._httpClient.post(`${this.API_URL}/create`, data);
    }

    getAllPrestation(personId?: string): Observable<any[]> {
        let params = personId ? new HttpParams().set('personId', personId) : undefined;
        return this._httpClient.get<any[]>(`${this.API_URL}/all`, { params });
    }

    deletePrestation(id: number): Observable<void> {
        return this._httpClient.delete<void>(`${this.API_URL}/delete/${id}`);

    }


    updatePrestation(id: string, prestation: any): Observable<any> {
        return this._httpClient.put<any>(
            `${this.API_URL}/update/${id}`,
            prestation
        );
    }

    getActiveReservationByPerson(personId: string): Observable<any> {
        return this._httpClient.get<any>(
            `${this.API_URL}/persons/${personId}/active-reservation`
        );
    }




}
