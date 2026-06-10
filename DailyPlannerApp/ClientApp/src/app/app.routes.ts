import { Routes } from '@angular/router';
import { NotesPageComponent } from './notes-page.component';
import { TasksPageComponent } from './tasks-page.component';

export const routes: Routes = [
  { path: '', component: NotesPageComponent, pathMatch: 'full' },
  { path: 'tasks', component: TasksPageComponent },
  { path: '**', redirectTo: '' }
];
