import { Injectable } from "@angular/core";
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { ImageResponse } from "functions/src/models/image-response";
import { httpsCallable, Functions } from "@angular/fire/functions";

@Injectable({
    providedIn:'root',
})
export class DalleService {
    constructor(
        public authService: AuthService,
        public httpClient: HttpClient,
        private functions: Functions){
    }

    public async createImage(imgUrl: string): Promise<ImageResponse> {
        var createEditImage = httpsCallable(this.functions, "createEditImage");
        return createEditImage({imgUrl: imgUrl})
        .then((result) => {
          const resp = result.data as ImageResponse;
          return resp;
        });
    }
}
