import { Injectable, NgZone } from '@angular/core';
import { User as usr } from '../services/user';
import { Auth, authState, sendEmailVerification, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, signInWithPopup, User } from '@angular/fire/auth';
import { doc, setDoc, DocumentReference, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any; // Save logged in user data
  constructor(
    public afs: Firestore, // Inject Firestore service
    public afAuth: Auth,
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    authState(afAuth).subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')!);
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
    });
  }
  // Sign in with email/password
  SignIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.afAuth, email, password)
      .then((result) => {
        this.SetUserData(result.user);
        authState(this.afAuth).subscribe((user) => {
          if (user) {
            this.router.navigate(['dashboard']);
          }
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
  // Sign up with email/password
  SignUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.afAuth, email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign 
        up and returns promise */
        this.SendVerificationMail();
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    var usr = (this.afAuth.currentUser) as User;
    return sendEmailVerification(usr)
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }
  // Reset Forggot password
  ForgotPassword(passwordResetEmail: string) {
    return sendPasswordResetEmail(this.afAuth, passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }
  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new GoogleAuthProvider());
  }
  // Auth logic to run auth providers
  AuthLogin(provider: any) {
    return signInWithPopup(this.afAuth, provider)
      .then((result) => {
        this.SetUserData(result.user).then(x => {
          this.router.navigate(['dashboard']);
        }).catch((error) => {
          window.alert(error);  
        })
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any) {
    const userRef: DocumentReference<any> = doc(this.afs, `users/${user.uid}`
    );
    const userData: usr = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return setDoc(userRef, userData);
  }
  // Sign out
  SignOut() {
    return signOut(this.afAuth).then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }
}