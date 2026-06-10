import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from './markdown.pipe';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  description: string;
  project?: string;
  persons?: string[];
  tags?: string[];
  createdAt: string;
}

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  template: `
    <article class="card task-card" *ngIf="task">
      <div class="task-header">
        <button
          type="button"
          class="toggle-button"
          [class.button-primary]="task.completed"
          (click)="updateTask('completed', !task.completed)"
          aria-label="Toggle task completion"
        >
          {{ task.completed ? '✓' : '○' }}
        </button>

        <div class="card-title" [class.editable]="!editingTitle" (dblclick)="editingTitle = true">
          <input
            *ngIf="editingTitle"
            class="input"
            [ngModel]="task.title"
            (ngModelChange)="updateTask('title', $event)"
            (blur)="editingTitle = false"
            (keydown.enter)="editingTitle = false"
            autofocus
          />
          <span [style.textDecoration]="task.completed ? 'line-through' : 'none'">{{ task.title || 'Untitled Task' }}</span>
        </div>

        <div class="toggle-row">
          <button type="button" class="toggle-button" (click)="toggleDetails()">
            {{ showDetails ? 'Hide details' : 'Details' }}
          </button>
          <button type="button" class="toggle-button" (click)="descMode = descMode === 'edit' ? 'preview' : 'edit'">
            {{ descMode === 'edit' ? 'Preview' : 'Edit' }}
          </button>
          <button type="button" class="toggle-button button-danger" (click)="delete.emit(task.id)">
            Delete
          </button>
        </div>
      </div>

      <div class="meta-strip" *ngIf="hasMetadata">
        <span class="meta-chip" *ngIf="task.project">{{ task.project }}</span>
        <span class="meta-chip" *ngFor="let person of task.persons">{{ person }}</span>
        <span class="tag-pill" *ngFor="let tag of task.tags">#{{ tag }}</span>
      </div>

      <div class="content-area" [style.max-height]="expanded ? 'none' : '160px'">
        <div class="card-toolbar">
          <span class="small-text">Description</span>
        </div>

        <textarea
          *ngIf="descMode === 'edit'"
          class="textarea"
          [ngModel]="task.description"
          (ngModelChange)="updateTask('description', $event)"
          placeholder="Add a description in Markdown…"
        ></textarea>

        <div *ngIf="descMode === 'preview'" class="task-preview">
          <div *ngIf="!task.description" class="small-text">No description.</div>
          <div *ngIf="task.description" [innerHTML]="task.description | markdown"></div>
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
              [class.button-primary]="task.project === option"
              (click)="toggleProject(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div class="details-row">
          <span class="label-text">Due</span>
          <input
            class="input"
            type="date"
            [value]="task.dueDate.slice(0, 10)"
            (change)="updateTaskDueDate($event)"
          />
        </div>

        <div class="details-row">
          <span class="label-text">People</span>
          <div class="details-row">
            <input
              class="input"
              type="text"
              [(ngModel)]="personInput"
              placeholder="Add person…"
              (keydown.enter)="addPerson(); $event.preventDefault()"
            />
            <button type="button" class="button button-primary" (click)="addPerson()">Add</button>
          </div>
          <div class="toggle-row">
            <button
              type="button"
              class="tag-pill"
              *ngFor="let person of task.persons"
              (click)="removePerson(person)"
            >
              {{ person }} ×
            </button>
          </div>
        </div>

        <div class="details-row">
          <span class="label-text">Tags</span>
          <div class="details-row">
            <input
              class="input"
              type="text"
              [(ngModel)]="tagInput"
              placeholder="Add tag…"
              (keydown.enter)="addTag(); $event.preventDefault()"
            />
            <button type="button" class="button button-primary" (click)="addTag()">Add</button>
          </div>
          <div class="toggle-row">
            <button
              type="button"
              class="tag-pill"
              *ngFor="let tag of task.tags"
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
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() update = new EventEmitter<{ id: string; updates: Partial<Task> }>();
  @Output() delete = new EventEmitter<string>();

  descMode: 'edit' | 'preview' = 'edit';
  expanded = false;
  editingTitle = false;
  showDetails = false;
  personInput = '';
  tagInput = '';

  projectOptions = ['Personal', 'Work', 'Research', 'Design', 'Engineering', 'Marketing', 'Finance', 'Other'];

  get hasMetadata(): boolean {
    return !!this.task.project || (this.task.persons?.length ?? 0) > 0 || (this.task.tags?.length ?? 0) > 0;
  }

  updateTask(field: keyof Task, value: unknown): void {
    this.update.emit({ id: this.task.id, updates: { [field]: value } as Partial<Task> });
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  toggleProject(project: string): void {
    this.update.emit({
      id: this.task.id,
      updates: {
        project: this.task.project === project ? undefined : project
      }
    });
  }

  addPerson(): void {
    const trimmed = this.personInput.trim();
    if (!trimmed) return;
    const persons = this.task.persons ?? [];
    if (!persons.includes(trimmed)) {
      this.update.emit({ id: this.task.id, updates: { persons: [...persons, trimmed] } });
    }
    this.personInput = '';
  }

  removePerson(person: string): void {
    this.update.emit({ id: this.task.id, updates: { persons: (this.task.persons ?? []).filter((p) => p !== person) } });
  }

  addTag(): void {
    const trimmed = this.tagInput.trim().replace(/^#/, '');
    if (!trimmed) return;
    const tags = this.task.tags ?? [];
    if (!tags.includes(trimmed)) {
      this.update.emit({ id: this.task.id, updates: { tags: [...tags, trimmed] } });
    }
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.update.emit({ id: this.task.id, updates: { tags: (this.task.tags ?? []).filter((t) => t !== tag) } });
  }

  updateTaskDueDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value;
    if (!value) {
      return;
    }
    this.update.emit({
      id: this.task.id,
      updates: { dueDate: new Date(value).toISOString() }
    });
  }
}
