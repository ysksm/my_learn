import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-side-navigator',
  standalone: true,
  imports: [MatSidenavModule, MatSelectModule, MatListModule, MatToolbar, 
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './side-navigator.component.html',
  styleUrl: './side-navigator.component.css'
})
export class SideNavigatorComponent {

  redirectToGoogle() {
    window.location.href = 'https://atlassian.net';
  }

}
