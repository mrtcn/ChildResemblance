import { Component, OnInit } from '@angular/core';
import {getStorage, ref, uploadBytes} from '@angular/fire/storage';
import { AuthService } from '../../shared/services/auth.service';
import { DalleService } from 'src/app/shared/services/ai-image/dalle.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  firstUploadedImage: any;
  firstUploadedImageAltText: string = "Upload Image";
	msg = "";
  url: any; //Angular 11, for stricter type
  file: any;
  responseUrl: any;

  constructor(
    public authService: AuthService,
    public aiImageService: DalleService) 
  {
  }
  ngOnInit(): void {}
  selectImage(event: any) { //Angular 11, for stricter type
		if(!event.target.files[0] || event.target.files[0].length == 0) {
			this.msg = 'You must select an image';
			return;
		}
		
		var mimeType = event.target.files[0].type;
		
		if (mimeType.match(/image\/*/) == null) {
			this.msg = "Only images are supported";
			return;
		}

    this.file = event.target.files[0];
    console.log("event.target.files[0] = " + event.target.files[0]);
		var reader = new FileReader();
		reader.readAsDataURL(event.target.files[0]);
		
		reader.onload = (_event) => {
			this.msg = "";
			this.url = reader.result; 
		}
	}  
  async uploadImage() {
    var img = this.file as File;

    const storage = getStorage();
    const imgPath = this.authService.afAuth.currentUser?.uid + ".png";
    const imageRef = ref(storage, imgPath);

    uploadBytes(imageRef, img).then(async (snapshot) => {
      console.log("snapshot: " + JSON.stringify(snapshot))
      var response = await this.aiImageService.createImage(snapshot.ref.fullPath)
      console.log("response: " + JSON.stringify(response, this.replacer));
      console.log("response.url= " + response.url);
      this.responseUrl = response.url;
    });
  }      
  replacer(key: string, value: any) {
    if(key === '_finalizers') {
      return null
    }
  
    return value
  }
}