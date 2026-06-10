import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="date-selector" (click)="$event.stopPropagation()">
      <button type="button" class="date-button" (click)="toggleOpen()">
        <span>{{ label }}</span>
        <span class="chevron">{{ open ? '▴' : '▾' }}</span>
      </button>
      <div class="date-panel" *ngIf="open">
        <label class="screen-reader-only" for="date-input">Choose date</label>
        <input
          id="date-input"
          type="date"
          [value]="dateValue"
          (change)="onDateChange($any($event.target).value)"
        />
      </div>
    </div>
  `,
  styles: [
    `
      .screen-reader-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `
  ]
})
export class DateSelectorComponent {
  @Input() date = new Date();
  @Output() dateChange = new EventEmitter<Date>();
  open = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  get label(): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(this.date);
  }

  get dateValue(): string {
    return this.date.toISOString().slice(0, 10);
  }

  toggleOpen(): void {
    this.open = !this.open;
  }

  onDateChange(value: string): void {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) {
      this.dateChange.emit(parsed);
    }
    this.open = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (this.open && target && !this.elementRef.nativeElement.contains(target)) {
      this.open = false;
    }
  }
}
