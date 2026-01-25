import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppUser } from '../../core/services/user-admin.service';

export interface UserDialogData {
  mode: 'add' | 'edit';
  value?: AppUser;
}

@Component({
  selector: 'sv-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
})
export class UserDialogComponent {
  mode: 'add' | 'edit' = 'add';

  form = this.fb.group({
    username: ['', Validators.required],
    full_name: [''],
    role_level: ['user'],
    scope_id: [null],
    is_active: [true],
    password: [''],
  });

  constructor(
    private fb: FormBuilder,
    public ref: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.mode = data?.mode ?? 'add';
    const v = data?.value;
    if (v) {
      this.form.patchValue({
        username: v.username,
        full_name: v.full_name ?? '',
        role_level: v.role_level ?? 'user',
        scope_id: v.scope_id ?? null,
        is_active: v.is_active ?? true,
      });
    }
  }

  close(): void {
    this.ref.close(null);
  }

  submit(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    // ถ้า edit แล้วไม่ต้องส่ง password ถ้าไม่ได้กรอก
    if (this.mode === 'edit' && !payload.password) {
      delete (payload as any).password;
    }
    this.ref.close(payload);
  }
}
