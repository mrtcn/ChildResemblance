import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, connectAuthEmulator, getAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideFunctions, getFunctions, connectFunctionsEmulator, FunctionsModule } from '@angular/fire/functions';
import { provideStorage, getStorage, connectStorageEmulator, StorageModule } from '@angular/fire/storage';
import { provideRemoteConfig,getRemoteConfig } from '@angular/fire/remote-config';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';

import { AuthService } from "./shared/services/auth.service";
import { DalleService } from "./shared/services/ai-image/dalle.service";

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FunctionsModule,
    StorageModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      console.log("provideAuth invoked");
      const auth = getAuth();
      if(!environment.production)
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      return auth;
    }),
    provideFirestore(() => {
      console.log("provideFirestore invoked");
      const firestore = getFirestore();
      if(!environment.production)
        connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
      return firestore;
    }),
    provideFunctions(() => {
      console.log("provideFunctions invoked");
      const funcs = getFunctions();
      if(!environment.production)
        connectFunctionsEmulator(funcs, "127.0.0.1", 5001);
      return funcs;
    }),
    provideStorage(() => {
      console.log("provideStorage invoked");
      const storage = getStorage();
      if(!environment.production)
        connectStorageEmulator(storage, "127.0.0.1", 9199);
      return storage;
    }),
    provideRemoteConfig(() => {
      console.log("provideRemoteConfig invoked");
      return getRemoteConfig();
    }),
  ],
  providers: [AuthService, DalleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
