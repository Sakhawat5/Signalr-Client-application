import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/shared/user.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor(public service: UserService, private router: Router, private toastr: ToastrService) { }

  
  ngOnInit(): void {
    this.service.formModel.reset();
    if (localStorage.getItem('token') != null)
      this.router.navigateByUrl('/home');
  }
  
  onSubmit() {
    this.service.register().subscribe(
      
      (res: any) => {
        
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('/home');

        if (res.succeeded) {
          this.service.formModel.reset();
          this.toastr.success('New user created!', 'Registration successful.');
        } else {
          //this.toastr.error('Username is already taken','Registration failed.');
          res.errors.forEach((e: { code: any; description: string | undefined; }) => {
            switch (e.code) {
              case 'DuplicateUserName':
                this.toastr.error('Username is already taken', 'Registration failed.');
                break;

              default:
                this.toastr.error(e.description, 'Registration failed.');
                break;
            }
            // res.error('Registration failed');
          });
        }
      },
      err => {
        console.log(err);
      }
    );
  }

}
