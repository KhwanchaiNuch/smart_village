import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Person } from '../../core/services/person.service';

export type PersonDialogMode = 'add' | 'edit';
export interface PersonDialogData {
  mode: PersonDialogMode;
  value?: Person;
}

@Component({
  selector: 'app-person-dialog',
  templateUrl: './person-dialog.component.html',
  styleUrls: ['./person-dialog.component.scss'],
})
export class PersonDialogComponent {
  title = 'เพิ่มบุคคล';

  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    cid: [''],
    gender: [''],
    dob: [''],
    phone: [''],
    household_id: [null],
    in_house_register: [true],
  });

  constructor(
    private fb: FormBuilder,
    public ref: MatDialogRef<PersonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PersonDialogData
  ) {
    const v = data?.value;
    if (v) {
      this.title = 'แก้ไขบุคคล';
      this.form.patchValue({
        first_name: v.first_name ?? '',
        last_name: v.last_name ?? '',
        cid: v.cid ?? '',
        gender: v.gender ?? '',
        dob: v.dob ?? '',
        phone: v.phone ?? '',
        household_id: v.household_id ?? null,
        in_house_register: v.in_house_register ?? true,
      });
    }
  }

  close(): void {
    this.ref.close();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.value);
  }
}
