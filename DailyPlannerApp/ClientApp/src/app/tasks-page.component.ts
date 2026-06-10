import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateSelectorComponent } from './date-selector.component';
import { TaskItemComponent, Task } from './task-item.component';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DateSelectorComponent, TaskItemComponent],
  template: `
    <section class="page-shell">
      <div class="page-subheader">
        <app-date-selector [date]="selectedDate" (dateChange)="selectedDate = $event"></app-date-selector>
        <div class="small-text">{{ pending.length }} pending · {{ done.length }} completed</div>
      </div>

      <div class="app-main page-shell">
        <div class="card panel" style="padding: 1rem; display: grid; gap: 1rem;">
          <div class="details-row">
            <input
              class="input"
              type="text"
              placeholder="Add a task for {{ selectedDate | date:'MMM d' }}…"
              [(ngModel)]="newTaskTitle"
              (keydown.enter)="addTask(); $event.preventDefault()"
            />
            <button
              type="button"
              class="button button-primary"
              (click)="addTask()"
              [disabled]="!newTaskTitle.trim()"
            >
              Add
            </button>
          </div>
        </div>

        <section *ngIf="pending.length > 0" class="page-shell" style="margin-top: 1.5rem;">
          <h2 class="label-text">To Do</h2>
          <div class="card-grid">
            <app-task-item
              *ngFor="let task of pending"
              [task]="task"
              (update)="updateTask($event.id, $event.updates)"
              (delete)="deleteTask($event)"
            ></app-task-item>
          </div>
        </section>

        <section *ngIf="done.length > 0" class="page-shell" style="margin-top: 1.5rem;">
          <h2 class="label-text">Completed</h2>
          <div class="card-grid">
            <app-task-item
              *ngFor="let task of done"
              [task]="task"
              (update)="updateTask($event.id, $event.updates)"
              (delete)="deleteTask($event)"
            ></app-task-item>
          </div>
        </section>

        <div *ngIf="dayTasks.length === 0" class="empty-state" style="margin-top: 1.5rem;">
          <strong>No tasks for {{ selectedDate | date:'MMMM d' }}</strong>
          <span>Add your first task above.</span>
        </div>
      </div>
    </section>
  `
})
export class TasksPageComponent {
  selectedDate = new Date();
  newTaskTitle = '';
  tasks: Task[] = [];

  get dayTasks(): Task[] {
    return this.tasks.filter((task) => this.isSameDay(new Date(task.dueDate), this.selectedDate));
  }

  get pending(): Task[] {
    return this.dayTasks.filter((task) => !task.completed);
  }

  get done(): Task[] {
    return this.dayTasks.filter((task) => task.completed);
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2, 10);
  }

  private createTask(dueDate: string, title: string): Task {
    return {
      id: this.generateId(),
      title,
      completed: false,
      dueDate,
      description: '',
      createdAt: new Date().toISOString()
    };
  }

  addTask(): void {
    const title = this.newTaskTitle.trim();
    if (!title) {
      return;
    }

    this.tasks = [this.createTask(this.selectedDate.toISOString(), title), ...this.tasks];
    this.newTaskTitle = '';
  }

  updateTask(id: string, updates: Partial<Task>): void {
    this.tasks = this.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task));
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
