import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Household } from '../../core/services/household.service';

export interface HouseholdDialogData {
  mode: 'add' | 'edit';
  value?: Household;
}

@Component({
  selector: 'sv-household-dialog',
  templateUrl: './household-dialog.component.html',
  styleUrls: ['./household-dialog.component.scss']
})
export class HouseholdDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<HouseholdDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HouseholdDialogData
  ) {
    const v = data.value;
    this.form = this.fb.group({
      household_id: [v?.household_id ?? null],
      house_no: [v?.house_no ?? '', Validators.required],
      moo: [v?.moo ?? '', Validators.required],
      village_name: [v?.village_name ?? '', Validators.required],
      tambon: [v?.tambon ?? '', Validators.required],
      amphur: [v?.amphur ?? '', Validators.required],
      province: [v?.province ?? '', Validators.required],
      head_name: [v?.head_name ?? '', Validators.required],
      members: [v?.members ?? 0, [Validators.required, Validators.min(0)]],
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close(this.form.value as Household);
  }

  close() {
    this.ref.close(null);
  }
}
