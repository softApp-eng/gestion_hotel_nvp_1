import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class ApiRolesService
{

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }

    getRoles(){
        return this._httpClient.get(
            `${environment.solidarityApi}/v1/roles/list`
        );
    }

    getPermissions(){
        return this._httpClient.get(
            `${environment.solidarityApi}/v1/roles/permissions`
        );
    }

    create(payload){
        return this._httpClient.post(
            `${environment.solidarityApi}/v1/roles/create`,
            payload
        );
    }

    update(payload,roleid){
        let params = new HttpParams().set('roleid', roleid);
        return this._httpClient.put(
            `${environment.solidarityApi}/v1/roles/update`,
            payload,
            { params }
        );
    }

    one(roleid){
        let params = new HttpParams().set('roleid', roleid);
        return this._httpClient.get(
            `${environment.solidarityApi}/v1/roles/one`,
            { params }
        );
    }

    delete(roleid){
        let params = new HttpParams().set('roleid', roleid);
        return this._httpClient.delete(
            `${environment.solidarityApi}/v1/roles/delete`,
            { params }
        );
    }

    clone(roleid){
        let params = new HttpParams().set('roleid', roleid);
        return this._httpClient.get(
            `${environment.solidarityApi}/v1/roles/clone`,
            { params }
        );
    }

}
