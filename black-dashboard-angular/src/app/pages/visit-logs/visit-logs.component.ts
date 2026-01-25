import { Component } from '@angular/core';
@Component({
  selector: 'app-visit-logs',
  templateUrl: './visit-logs.component.html',
  styleUrls: ['./visit-logs.component.scss']
})
export class VisitLogsComponent {
  visits = [{date:'2026-01-01', note:'เยี่ยมผู้สูงอายุ'}];
}
