import { Component, inject, signal } from '@angular/core';
import { SessionService } from './session.service';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [],
  template: `
    <section>
      <p>Current session ID: {{ session.sessionId() }}</p>
      <p>
        <button (click)="newSession()" [disabled]="wait()">New session</button>
      </p>
    </section>
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
