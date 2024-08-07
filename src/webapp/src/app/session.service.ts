import { Injectable } from '@angular/core';

const api = 'http://localhost:7071/api';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  async runCode(code: string) {
  }

  async uploadFile(name: string, data: Blob) {

  }

  async downaloadFile(name: string) {
  }

  async listFiles() {
  }
}
