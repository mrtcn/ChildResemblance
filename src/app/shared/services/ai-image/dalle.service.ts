import { Injectable } from "@angular/core";
import { AuthService } from '../auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from "rxjs";
import { ResponseModel } from '../../models/http/response-model';
import { NextOrObserver } from "firebase/auth";
import { httpsCallable, getFunctions } from "firebase/functions";
import {DalleCreateResponse} from "../../models/http/dalle-create-response"
import { ImageResponse } from "functions/src/models/image-response";

@Injectable({
    providedIn:'root',
})
export class DalleService {
    constructor(
        public authService: AuthService,
        public httpClient: HttpClient){
    }

    public async createImage(imgUrl: string): Promise<ImageResponse> {
        // var token = await this.authService.afAuth.currentUser?.getIdTokenResult();
        // const httpOptions = {
        //     headers: new HttpHeaders({
        //         'Content-Type':  'application/json',
        //         Authorization: 'Bearer ' + token?.token})
        // };
        // console.log("reader.result: " + imgUrl);        
        // return this.httpClient.get("http://127.0.0.1:5001/child-resemblance/us-central1/createEditImage?imgUrl="+imgUrl, httpOptions);
        var functions = getFunctions();
        var createEditImage = httpsCallable(functions, "createEditImage");
        return createEditImage({imgUrl: imgUrl})
        .then((result) => {
          const resp = result.data as ImageResponse;
          return resp;
        });

    }
    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }

      replacer(key: string, value: any) {
        if(key === '_finalizers') {
          return null
        }
      
        return value
      }
}
