import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateSelectorComponent } from './date-selector.component';
import { NoteCardComponent, Note } from './note-card.component';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [CommonModule, DateSelectorComponent, NoteCardComponent],
  template: `
    <section class="page-shell">
      <div class="page-subheader">
        <app-date-selector [date]="selectedDate" (dateChange)="selectedDate = $event"></app-date-selector>
        <button type="button" class="button button-primary" (click)="addNote()">+ New Note</button>
      </div>

      <div class="app-main page-shell">
        <div *ngIf="notes.length === 0" class="empty-state">
          <strong>No notes yet</strong>
          <span>Click New Note to get started.</span>
        </div>

        <div *ngIf="notes.length > 0" class="card-grid">
          <app-note-card
            *ngFor="let note of notes"
            [note]="note"
            (update)="updateNote($event.id, $event.updates)"
            (delete)="deleteNote($event)"
          ></app-note-card>
        </div>
      </div>
    </section>
  `
})
export class NotesPageComponent {
  selectedDate = new Date();
  notes: Note[] = [this.createNote()];

  private generateId(): string {
    return Math.random().toString(36).slice(2, 10);
  }

  private createNote(): Note {
    return {
      id: this.generateId(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString()
    };
  }

  addNote(): void {
    this.notes = [this.createNote(), ...this.notes];
  }

  updateNote(id: string, updates: Partial<Note>): void {
    this.notes = this.notes.map((note) => (note.id === id ? { ...note, ...updates } : note));
  }

  deleteNote(id: string): void {
    this.notes = this.notes.filter((note) => note.id !== id);
  }
}
