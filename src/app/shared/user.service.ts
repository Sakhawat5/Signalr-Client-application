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
  FirstName: any
  LastName: any
  UserN : any

  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = 'http://localhost:54277/api';

  formModel = this.fb.group({
    UserName: [''],
    Email: ['', Validators.email],
    FirstName: ['', Validators.required],
    LastName: ['', Validators.required],
    //FullName: [''],
    Passwords: this.fb.group({
      Password: ['', [Validators.minLength(4)]],
      ConfirmPassword: ['']
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
      FirstName: this.formModel.value.FirstName,
      LastName: this.formModel.value.LastName,
      Email: this.formModel.value.Email,
      //FullName: this.formModel.value.FullName,
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
    this.UserID=userid;
    this.UserFullName=payLoad.FirstName +' '+ payLoad.LastName;
    this.FirstName = payLoad.FirstName;
    this.LastName = payLoad.LastName;
    this.UserN=payLoad.UserName;
    allowedRoles.forEach((e :any ) => {
      if (userRole == e) {
        isMatch = true;
      }
  
    });
    return isMatch;
  }

}
