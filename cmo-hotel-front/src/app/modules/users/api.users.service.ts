import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class ApiUsersService
{

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }

    getUsers(){
        return this._httpClient.get(
            `${environment.solidarityApi}/v1/users/list`
        );
    }

    getUser(userid){
        let params = new HttpParams().set('userID', userid);
        return this._httpClient.get(
            `${environment.solidarityApi}/v1/users/one`,
            { params }
        );
    }

    createUser(payload){
        return this._httpClient.post(
            `${environment.solidarityApi}/v1/users/create`,
            payload
        );
    }

    updateUser(payload,userid){
        let params = new HttpParams().set('userID', userid);
        return this._httpClient.put(
            `${environment.solidarityApi}/v1/users/update`,
            payload,
            { params }
        );
    }

    updateMdpUser(payload,userid){
        let params = new HttpParams().set('userID', userid);
        return this._httpClient.put(
            `${environment.solidarityApi}/v1/users/password`,
            payload,
            { params }
        );
    }

    assignRoles(userID,rolesID){
        return this._httpClient.put(
            `${environment.solidarityApi}/v1/users/roles/assign`,
            {userid:userID,roles:rolesID}
        );
    }

    assignRoomsResource(userID,roomsID){
        return this._httpClient.put(
            `${environment.solidarityApi}/v1/users/resources/rooms`,
            {userid:userID,rooms:roomsID}
        );
    }

    getUserResources(userid){
        let params = new HttpParams().set('userID', userid);
        return this._httpClient.get(
            `${environment.solidarityApi}/v1/users/resources`,
            { params }
        );
    }

}
