import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from './session.service';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule],
  template: `
    <fieldset>
      <legend>Session</legend>
      <p>Current session ID: {{ session.sessionId() }}</p>
      <p>
        <button (click)="newSession()" [disabled]="wait()">New session</button>
      </p>
      @if (session.files().length) {
        <hr>
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Size</th>
              <th>Last modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let file of session.files()">
              <td>{{ file.filename }}</td>
              <td>{{ file.size }}</td>
              <td>{{ file.last_modified_time }}</td>
              <td>
                <!-- <button>Load in editor</button> -->
                <!-- <button>Download</button> -->
                <!-- <button>Delete</button> -->
              </td>
            </tr>
          </tbody>
        </table>
      }
    </fieldset>
  `,
  styles: ``
})
export class SessionComponent {
  session = inject(SessionService);
  wait = signal<boolean>(false);

  async newSession() {
    this.wait.set(true);
    const sessionId = await this.session.createNewSession();
    this.wait.set(false);
  }
}
