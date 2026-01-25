import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  model = {
    username: '',
    password: '',
  };

  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  login(): void {
    if (!this.model.username || !this.model.password) {
      this.toastr.warning('กรุณากรอก Username/Password');
      return;
    }

    this.loading = true;
    this.auth.login(this.model).subscribe({
      next: () => {
        this.loading = false;
        this.toastr.success('เข้าสู่ระบบสำเร็จ');
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Login ไม่สำเร็จ';
        this.toastr.error(msg);
      },
    });
  }
}
