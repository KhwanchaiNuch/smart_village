import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserDto } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent implements OnInit {
  profile: Partial<UserDto> = {
    full_name: '',
    username: '',
    role_level: '',
    scope_name: '',
  };

  pwd = {
    current: '',
    next: '',
    confirm: '',
  };

  loading = false;

  constructor(private auth: AuthService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadMe();
  }

  loadMe(): void {
    this.loading = true;
    this.auth.getMe().subscribe({
      next: (u) => {
        this.profile = u || {};
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  saveProfile(): void {
    this.loading = true;
    this.auth.updateProfile(this.profile).subscribe({
      next: () => {
        this.toastr.success('บันทึกโปรไฟล์เรียบร้อย');
        this.loadMe();
      },
      error: () => {
        this.loading = false;
        this.toastr.error('บันทึกโปรไฟล์ไม่สำเร็จ');
      },
    });
  }

  changePassword(): void {
    if (!this.pwd.next || this.pwd.next !== this.pwd.confirm) {
      this.toastr.warning('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    this.loading = true;
    this.auth.changePassword(this.pwd.current, this.pwd.next).subscribe({
      next: () => {
        this.loading = false;
        this.pwd = { current: '', next: '', confirm: '' };
        this.toastr.success('เปลี่ยนรหัสผ่านสำเร็จ');
      },
      error: () => {
        this.loading = false;
        this.toastr.error('เปลี่ยนรหัสผ่านไม่สำเร็จ');
      },
    });
  }
}
