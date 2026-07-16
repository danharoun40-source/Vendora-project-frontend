import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() count?: number;
  @Input() size: 'sm' | 'md' = 'sm';

  get stars() {
    return [1, 2, 3, 4, 5];
  }

  get rounded() {
    return Math.round(this.rating || 0);
  }
}
