import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  loading = false;
  stats = [
    { label: 'ครัวเรือน', value: 0 },
    { label: 'ประชากร', value: 0 },
    { label: 'ปัญหาเปิดอยู่', value: 0 },
    { label: 'ลงพื้นที่เดือนนี้', value: 0 },
  ];

  constructor(private dash: DashboardService) {}

  ngOnInit(): void {
    this.loading = true;
    this.dash.getSummary().subscribe({
      next: (s) => {
        this.stats = [
          { label: 'ครัวเรือน', value: s.households ?? 0 },
          { label: 'ประชากร', value: s.persons ?? 0 },
          { label: 'ปัญหาเปิดอยู่', value: s.issues_open ?? 0 },
          { label: 'ลงพื้นที่เดือนนี้', value: s.visits_month ?? 0 },
        ];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
