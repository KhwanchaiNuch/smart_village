import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppUser, UserAdminService } from '../../core/services/user-admin.service';
import { UserDialogComponent } from './user-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {  columns = ['username', 'full_name', 'role_level', 'scope_id', 'is_active', 'actions'];

  loading = false;
  q = '';
  rows: AppUser[] = [];
  filtered: AppUser[] = [];
  constructor(
    private api: UserAdminService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.list().subscribe({
      next: (data) => {
        this.rows = data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('โหลดข้อมูลผู้ใช้ไม่สำเร็จ', 'ปิด', { duration: 2500 });
      },
    });
  }

  applyFilter(): void {
    const q = (this.q || '').trim().toLowerCase();
    this.filtered = !q
      ? [...this.rows]
      : this.rows.filter((r) =>
          [r.username, r.full_name, r.role_level, String(r.scope_id ?? ''), String(r.is_active ?? '')]
            .join(' ')
            .toLowerCase()
            .includes(q)
        );
  }

  openAdd(): void {
    const ref = this.dialog.open(UserDialogComponent, {
      width: '720px',
      data: { mode: 'add' },
    });
    ref.afterClosed().subscribe((value: AppUser | undefined) => {
      if (!value) return;
      this.api.create(value).subscribe({
        next: () => {
          this.snack.open('บันทึกสำเร็จ', 'ปิด', { duration: 2000 });
          this.load();
        },
        error: () => this.snack.open('บันทึกไม่สำเร็จ', 'ปิด', { duration: 2500 }),
      });
    });
  }

  openEdit(row: AppUser): void {
    const ref = this.dialog.open(UserDialogComponent, {
      width: '720px',
      data: { mode: 'edit', value: row },
    });
    ref.afterClosed().subscribe((value: AppUser | undefined) => {
      if (!value || !row.user_id) return;
      this.api.update(row.user_id, value).subscribe({
        next: () => {
          this.snack.open('แก้ไขสำเร็จ', 'ปิด', { duration: 2000 });
          this.load();
        },
        error: () => this.snack.open('แก้ไขไม่สำเร็จ', 'ปิด', { duration: 2500 }),
      });
    });
  }

  remove(row: AppUser): void {
    if (!row.user_id) return;
    if (!confirm('ยืนยันลบรายการนี้?')) return;

    this.api.remove(row.user_id).subscribe({
      next: () => {
        this.snack.open('ลบสำเร็จ', 'ปิด', { duration: 2000 });
        this.load();
      },
      error: () => this.snack.open('ลบไม่สำเร็จ', 'ปิด', { duration: 2500 }),
    });
  }
}
