import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HealthVisit } from '../../core/services/health.service';

export interface HealthDialogData {
  mode: 'add' | 'edit';
  value?: HealthVisit;
}

@Component({
  selector: 'sv-health-dialog',
  templateUrl: './health-dialog.component.html',
  styleUrls: ['./health-dialog.component.scss'],
})
export class HealthDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public ref: MatDialogRef<HealthDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HealthDialogData
  ) {
    const v = data.value;
    this.form = this.fb.group({
      person_id: [v?.person_id ?? null],
      person_name: [v?.person_name ?? '', Validators.required],
      visit_date: [v?.visit_date ?? '', Validators.required],
      chronic_disease: [v?.chronic_disease ?? ''],
      is_bedridden: [v?.is_bedridden ?? false],
      note: [v?.note ?? ''],
    });
  }

  close() {
    this.ref.close();
  }

  submit() {
    if (this.form.invalid) return;
    this.ref.close(this.form.value);
  }
}
