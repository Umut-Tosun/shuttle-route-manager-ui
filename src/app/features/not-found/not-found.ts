import { Component } from '@angular/core';

import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFoundComponent {
  constructor(
    private router: Router,
    private location: Location
  ) {}

  goHome() {
    this.router.navigate(['/dashboard']);
  }

  goBack() {
    this.location.back();
  }
}