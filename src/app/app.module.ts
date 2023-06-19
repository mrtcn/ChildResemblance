import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { provideAuth, connectAuthEmulator, getAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideFunctions, getFunctions, connectFunctionsEmulator } from '@angular/fire/functions';
import { provideStorage, getStorage, connectStorageEmulator } from '@angular/fire/storage';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
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
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideStorage(() => {
      const storage = getStorage();
      if(!environment.production)
        connectStorageEmulator(storage, "127.0.0.1", 8081);
      return storage;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if(!environment.production)
        connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
      return firestore;
    }),    
    provideAuth(() => {
      const auth = getAuth();
      if(!environment.production)
        connectAuthEmulator(auth, "http://127.0.0.1:9099");
      return auth;
    }),
    provideFunctions(() => {
      const funcs = getFunctions();
      if(!environment.production)
        connectFunctionsEmulator(funcs, "127.0.0.1", 5001);
      return funcs;
    }),
    AngularFireStorageModule,
    AngularFireDatabaseModule,
  ],
  providers: [AuthService, DalleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
