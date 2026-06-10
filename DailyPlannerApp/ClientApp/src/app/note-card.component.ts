import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from './markdown.pipe';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  project?: string;
  noteDate?: string;
  persons?: string[];
  tags?: string[];
}

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  template: `
    <article class="card note-card" *ngIf="note">
      <div class="card-header">
        <div class="card-title" [class.editable]="!editingTitle" (dblclick)="editingTitle = true">
          <input
            *ngIf="editingTitle"
            class="input"
            [ngModel]="note.title"
            (ngModelChange)="updateNote('title', $event)"
            (blur)="editingTitle = false"
            (keydown.enter)="editingTitle = false"
            autofocus
          />
          <span *ngIf="!editingTitle">{{ note.title || 'Untitled Note' }}</span>
        </div>
        <div class="toggle-row">
          <button type="button" class="toggle-button" (click)="toggleDetails()">
            {{ showDetails ? 'Hide details' : 'Details' }}
          </button>
          <button type="button" class="toggle-button" (click)="mode = mode === 'edit' ? 'preview' : 'edit'">
            {{ mode === 'edit' ? 'Preview' : 'Edit' }}
          </button>
          <button type="button" class="toggle-button button-danger" (click)="delete.emit(note.id)">
            Delete
          </button>
        </div>
      </div>

      <div class="meta-strip" *ngIf="hasMetadata">
        <span class="meta-chip" *ngIf="note.project">{{ note.project }}</span>
        <span class="meta-chip" *ngIf="note.noteDate">{{ note.noteDate | date:'mediumDate' }}</span>
        <span class="meta-chip" *ngFor="let person of note.persons">{{ person }}</span>
        <span class="tag-pill" *ngFor="let tag of note.tags">#{{ tag }}</span>
      </div>

      <div class="content-area" [style.max-height]="expanded ? 'none' : '220px'">
        <textarea
          *ngIf="mode === 'edit'"
          class="textarea"
          [ngModel]="note.content"
          (ngModelChange)="updateNote('content', $event)"
          placeholder="Write your note in Markdown…"
        ></textarea>

        <div *ngIf="mode === 'preview'" class="notes-preview">
          <div *ngIf="!note.content" class="small-text">No content yet.</div>
          <div *ngIf="note.content" [innerHTML]="note.content | markdown"></div>
        </div>
      </div>

      <button type="button" class="expand-button" (click)="expanded = !expanded">
        {{ expanded ? 'Collapse' : 'Expand' }}
      </button>

      <div class="details-panel" *ngIf="showDetails">
        <div class="details-row">
          <span class="label-text">Project</span>
          <div class="toggle-row">
            <button
              *ngFor="let option of projectOptions"
              type="button"
              class="toggle-button"
              [class.button-primary]="note.project === option"
              (click)="toggleProject(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div class="details-row">
          <span class="label-text">Date</span>
          <input
            class="input"
            type="date"
            [value]="note.noteDate ? note.noteDate.slice(0, 10) : ''"
            (change)="updateNoteDate($event)"
          />
        </div>

        <div class="details-row">
          <span class="label-text">People</span>
          <div class="details-row">
            <input class="input" type="text" [(ngModel)]="personInput" placeholder="Add person…" (keydown.enter)="addPerson(); $event.preventDefault()" />
            <button type="button" class="button button-primary" (click)="addPerson()">Add</button>
          </div>
          <div class="toggle-row">
            <button
              type="button"
              class="tag-pill"
              *ngFor="let person of note.persons"
              (click)="removePerson(person)"
            >
              {{ person }} ×
            </button>
          </div>
        </div>

        <div class="details-row">
          <span class="label-text">Tags</span>
          <div class="details-row">
            <input class="input" type="text" [(ngModel)]="tagInput" placeholder="Add tag…" (keydown.enter)="addTag(); $event.preventDefault()" />
            <button type="button" class="button button-primary" (click)="addTag()">Add</button>
          </div>
          <div class="toggle-row">
            <button
              type="button"
              class="tag-pill"
              *ngFor="let tag of note.tags"
              (click)="removeTag(tag)"
            >
              #{{ tag }} ×
            </button>
          </div>
        </div>
      </div>
    </article>
  `
})
export class NoteCardComponent {
  @Input() note!: Note;
  @Output() update = new EventEmitter<{ id: string; updates: Partial<Note> }>();
  @Output() delete = new EventEmitter<string>();

  mode: 'edit' | 'preview' = 'edit';
  expanded = false;
  editingTitle = false;
  showDetails = false;
  personInput = '';
  tagInput = '';

  projectOptions = ['Personal', 'Work', 'Research', 'Design', 'Engineering', 'Marketing', 'Finance', 'Other'];

  get hasMetadata(): boolean {
    return !!this.note.project || !!this.note.noteDate || (this.note.persons?.length ?? 0) > 0 || (this.note.tags?.length ?? 0) > 0;
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  updateNote(field: keyof Note, value: unknown): void {
    this.update.emit({ id: this.note.id, updates: { [field]: value } as Partial<Note> });
  }

  toggleProject(project: string): void {
    this.update.emit({
      id: this.note.id,
      updates: {
        project: this.note.project === project ? undefined : project
      }
    });
  }

  addPerson(): void {
    const trimmed = this.personInput.trim();
    if (!trimmed) {
      return;
    }
    const persons = this.note.persons ?? [];
    if (!persons.includes(trimmed)) {
      this.update.emit({ id: this.note.id, updates: { persons: [...persons, trimmed] } });
    }
    this.personInput = '';
  }

  removePerson(person: string): void {
    this.update.emit({ id: this.note.id, updates: { persons: (this.note.persons ?? []).filter((p) => p !== person) } });
  }

  addTag(): void {
    const trimmed = this.tagInput.trim().replace(/^#/, '');
    if (!trimmed) {
      return;
    }
    const tags = this.note.tags ?? [];
    if (!tags.includes(trimmed)) {
      this.update.emit({ id: this.note.id, updates: { tags: [...tags, trimmed] } });
    }
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.update.emit({ id: this.note.id, updates: { tags: (this.note.tags ?? []).filter((t) => t !== tag) } });
  }

  updateNoteDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value;
    this.update.emit({
      id: this.note.id,
      updates: { noteDate: value ? new Date(value).toISOString() : undefined }
    });
  }
}
