import { Component } from '@angular/core';
@Component({
  selector: 'app-community-issues',
  templateUrl: './community-issues.component.html',
  styleUrls: ['./community-issues.component.scss']
})
export class CommunityIssuesComponent {
  issues = [{type:'น้ำท่วม',status:'เปิด'}];
}
