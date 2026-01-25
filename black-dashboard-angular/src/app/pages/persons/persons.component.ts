import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PersonDialogComponent } from './person-dialog.component';
import { PersonService, Person } from '../../core/services/person.service';

export type PersonRow = Person;

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
})
export class PersonsComponent implements OnInit {
  q = '';
  rows: PersonRow[] = [];
  filtered: PersonRow[] = [];
  cols = ['cid', 'name', 'household_id', 'gender', 'phone', 'actions'];
  loading = false;

  constructor(private dialog: MatDialog, private api: PersonService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.list().subscribe({
      next: (res) => {
        this.rows = res || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.rows = [];
        this.filtered = [];
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const q = (this.q || '').trim().toLowerCase();
    if (!q) {
      this.filtered = [...this.rows];
      return;
    }

    this.filtered = this.rows.filter((x) => {
      const name = `${x.first_name || ''} ${x.last_name || ''}`.toLowerCase();
      const cid = (x.citizen_id || '').toLowerCase();
      const house = (x.house_no || '').toLowerCase();
      return name.includes(q) || cid.includes(q) || house.includes(q);
    });
  }

  clearFilter(): void {
    this.q = '';
    this.applyFilter();
  }

  openAdd(): void {
    const ref = this.dialog.open(PersonDialogComponent, {
      width: '720px',
      data: { mode: 'add' as const },
    });
    ref.afterClosed().subscribe((val) => {
      if (!val) return;
      this.api.create(val).subscribe({
        next: () => {
          this.snack.open('บันทึกสำเร็จ', 'ปิด', { duration: 2000 });
          this.load();
        },
        error: (e) => {
          console.error(e);
          this.snack.open('บันทึกไม่สำเร็จ', 'ปิด', { duration: 2500 });
        },
      });
    });
  }

  openEdit(row: PersonRow): void {
    const ref = this.dialog.open(PersonDialogComponent, {
      width: '720px',
      data: { mode: 'edit' as const, value: row },
    });
    ref.afterClosed().subscribe((val) => {
      if (!val) return;
      const id = row.person_id ?? (row as any).id;
      if (!id) {
        this.snack.open('ไม่พบ person_id สำหรับแก้ไข', 'ปิด', { duration: 2500 });
        return;
      }
      this.api.update(id, val).subscribe({
        next: () => {
          this.snack.open('แก้ไขสำเร็จ', 'ปิด', { duration: 2000 });
          this.load();
        },
        error: (e) => {
          console.error(e);
          this.snack.open('แก้ไขไม่สำเร็จ', 'ปิด', { duration: 2500 });
        },
      });
    });
  }

  remove(row: PersonRow): void {
    const id = row.person_id ?? (row as any).id;
    if (!id) return;
    if (!confirm('ลบรายการนี้?')) return;
    this.api.remove(id).subscribe({
      next: () => {
        this.snack.open('ลบสำเร็จ', 'ปิด', { duration: 2000 });
        this.load();
      },
      error: (e) => {
        console.error(e);
        this.snack.open('ลบไม่สำเร็จ', 'ปิด', { duration: 2500 });
      },
    });
  }
}
