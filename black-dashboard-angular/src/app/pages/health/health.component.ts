import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HealthService, HealthVisit } from '../../core/services/health.service';
import { HealthDialogComponent } from './health-dialog.component';

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss'],
})
export class HealthComponent implements OnInit {
  loading = false;
  q = '';
  cols: string[] = ['person_name', 'chronic_disease', 'visit_date', 'bp', 'weight', 'action'];
  rows: HealthVisit[] = [];
  filtered: HealthVisit[] = [];

  constructor(
    private api: HealthService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.api.list().subscribe({
      next: (res) => {
        this.rows = res || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('โหลดข้อมูลสุขภาพไม่สำเร็จ', 'ปิด', { duration: 2500 });
      },
    });
  }

  applyFilter(): void {
    const q = (this.q || '').trim().toLowerCase();
    if (!q) {
      this.filtered = [...this.rows];
      return;
    }
    this.filtered = this.rows.filter((x) =>
      `${x.person_name || ''} ${x.chronic_disease || ''}`.toLowerCase().includes(q)
    );
  }

  openAdd(): void {
    const ref = this.dialog.open(HealthDialogComponent, {
      width: '720px',
      data: { mode: 'add' },
    });
    ref.afterClosed().subscribe((val?: HealthVisit) => {
      if (!val) return;
      this.api.create(val).subscribe({
        next: () => {
          this.snack.open('บันทึกสำเร็จ', 'ปิด', { duration: 1500 });
          this.reload();
        },
        error: () => this.snack.open('บันทึกไม่สำเร็จ', 'ปิด', { duration: 2500 }),
      });
    });
  }

  openEdit(row: HealthVisit): void {
    const ref = this.dialog.open(HealthDialogComponent, {
      width: '720px',
      data: { mode: 'edit', value: row },
    });
    ref.afterClosed().subscribe((val?: HealthVisit) => {
      if (!val) return;
      const id = row.visit_id as any;
      this.api.update(id, val).subscribe({
        next: () => {
          this.snack.open('แก้ไขสำเร็จ', 'ปิด', { duration: 1500 });
          this.reload();
        },
        error: () => this.snack.open('แก้ไขไม่สำเร็จ', 'ปิด', { duration: 2500 }),
      });
    });
  }

  remove(row: HealthVisit): void {
    if (!confirm('ลบรายการนี้?')) return;
    const id = row.visit_id as any;
    this.api.delete(id).subscribe({
      next: () => {
        this.snack.open('ลบสำเร็จ', 'ปิด', { duration: 1500 });
        this.reload();
      },
      error: () => this.snack.open('ลบไม่สำเร็จ', 'ปิด', { duration: 2500 }),
    });
  }
}
