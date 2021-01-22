import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  UserID:any
  UserFullName : any
  UserN : any

  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = 'http://localhost:54277/api';

  formModel = this.fb.group({
    UserName: ['', Validators.required],
    Email: ['', Validators.email],
    FullName: [''],
    Passwords: this.fb.group({
      Password: ['', [Validators.required, Validators.minLength(4)]],
      ConfirmPassword: ['', Validators.required]
    }, { validator: this.comparePasswords })

  });

  comparePasswords(fb: FormGroup) {
    let confirmPswrdCtrl = fb.get('ConfirmPassword');
    if (confirmPswrdCtrl?.errors == null || 'passwordMismatch' in confirmPswrdCtrl?.errors) {
      if (fb.get('Password')?.value != confirmPswrdCtrl?.value)
        confirmPswrdCtrl?.setErrors({ passwordMismatch: true });
      else
        confirmPswrdCtrl?.setErrors(null);
    }
  }

  register() {
    var body = {
      UserName: this.formModel.value.UserName,
      Email: this.formModel.value.Email,
      FullName: this.formModel.value.FullName,
      Password: this.formModel.value.Passwords.Password
    };
    return this.http.post(this.BaseURI + '/ApplicationUser/Register', body);
    //return this.http.post(this.BaseURI + '/ApplicationUser/Login', formData);
  }
  login(formData: any) {
    return this.http.post(this.BaseURI + '/ApplicationUser/Login', formData);
  }

  getUserProfile() {
    return this.http.get(this.BaseURI + '/UserProfile');
  }
  
  roleMatch(allowedRoles: any): boolean {
    var isMatch = false;
    var token = localStorage.getItem('token');
    if(token){
      var payLoad = JSON.parse(window.atob(token.split('.')[1]));
    }
    var userRole = payLoad.role;
    var userid = payLoad.UserID;
    this.UserID=userid
    this.UserFullName=payLoad.FullName
    this.UserN=payLoad.UserName
    allowedRoles.forEach((e :any ) => {
      if (userRole == e) {
        isMatch = true;
      }
  
    });
    return isMatch;
  }

}
