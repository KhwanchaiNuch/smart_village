import { Component } from '@angular/core';

interface ReportRow {
  area: string;
  households: number;
  persons: number;
  bedridden: number;
  issuesOpen: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  // mock filters
  filters = {
    provinceId: null as any,
    amphurId: null as any,
    tambonId: null as any,
    villageId: null as any,
    keyword: ''
  };

  rows: ReportRow[] = [
    { area: 'หมู่ 1 บ้านตัวอย่าง', households: 32, persons: 120, bedridden: 1, issuesOpen: 2 },
    { area: 'หมู่ 2 บ้านตัวอย่าง', households: 28, persons: 98,  bedridden: 0, issuesOpen: 1 },
    { area: 'หมู่ 3 บ้านตัวอย่าง', households: 41, persons: 150, bedridden: 2, issuesOpen: 4 }
  ];

  get filteredRows(): ReportRow[] {
    const kw = (this.filters.keyword || '').trim().toLowerCase();
    if (!kw) return this.rows;
    return this.rows.filter(r => r.area.toLowerCase().includes(kw));
  }

  exportCsv(): void {
    // Mock export (UI only) - you will wire API/export later
    const header = ['Area','Households','Persons','Bedridden','IssuesOpen'];
    const lines = [header.join(',')].concat(
      this.filteredRows.map(r => [r.area, r.households, r.persons, r.bedridden, r.issuesOpen].join(','))
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart-village-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
