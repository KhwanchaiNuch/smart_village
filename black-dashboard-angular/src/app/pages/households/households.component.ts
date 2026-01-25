import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HouseholdDialogComponent } from './household-dialog.component';
import { HouseholdService, Household } from '../../core/services/household.service';

@Component({
  selector: 'app-households',
  templateUrl: './households.component.html',
  styleUrls: ['./households.component.scss'],
})
export class HouseholdsComponent implements OnInit {
  rows: Household[] = [];
  filteredRows: Household[] = [];
  filterText = '';

  // for mat-table template compatibility
  displayedColumns: string[] = ['house_no', 'head_full_name', 'members_count', 'area_path', 'actions'];

  loading = false;

  constructor(
    private api: HouseholdService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.list().subscribe({
      next: (res) => {
        this.rows = res ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('โหลดข้อมูลครัวเรือนไม่สำเร็จ', 'ปิด', { duration: 2500 });
      },
    });
  }

  applyFilter(): void {
    const q = (this.filterText || '').toLowerCase().trim();
    if (!q) {
      this.filteredRows = [...this.rows];
      return;
    }

    this.filteredRows = this.rows.filter((r) => {
      const hay = [
        r.house_no,
        r.head_full_name,
        r.area_path,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  add(): void {
    this.openDialog('add');
  }

  edit(row: Household): void {
    this.openDialog('edit', row);
  }

  remove(row: Household): void {
    if (!row.household_id) return;
    if (!confirm('ลบรายการนี้?')) return;
    this.api.delete(row.household_id).subscribe({
      next: () => {
        this.snack.open('ลบสำเร็จ', 'ปิด', { duration: 1500 });
        this.load();
      },
      error: () => this.snack.open('ลบไม่สำเร็จ', 'ปิด', { duration: 2500 }),
    });
  }

  private openDialog(mode: 'add' | 'edit', value?: Household): void {
    const ref = this.dialog.open(HouseholdDialogComponent, {
      width: '720px',
      data: { mode, value },
    });

    ref.afterClosed().subscribe((val: Household | null) => {
      if (!val) return;

      // create / update
      if (mode === 'add') {
        this.api.create(val).subscribe({
          next: () => {
            this.snack.open('บันทึกสำเร็จ', 'ปิด', { duration: 1500 });
            this.load();
          },
          error: () => this.snack.open('บันทึกไม่สำเร็จ', 'ปิด', { duration: 2500 }),
        });
        return;
      }

      const id = value?.household_id ?? val.household_id;
      if (!id) {
        this.snack.open('ไม่พบ household_id สำหรับแก้ไข', 'ปิด', { duration: 2500 });
        return;
      }

      this.api.update(id, val).subscribe({
        next: () => {
          this.snack.open('แก้ไขสำเร็จ', 'ปิด', { duration: 1500 });
          this.load();
        },
        error: () => this.snack.open('แก้ไขไม่สำเร็จ', 'ปิด', { duration: 2500 }),
      });
    });
  }
}
