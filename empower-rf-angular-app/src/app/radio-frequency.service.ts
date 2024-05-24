import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RadioFrequencyService {
  private radioFrequencySubject = new BehaviorSubject<string>('101.1');
  radioFrequency$ = this.radioFrequencySubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.connectToSSE();
  }

  connectToSSE() {
    const eventSource = new EventSource('/api/radioFrequency');
    
    eventSource.onmessage = (event) => {
      this.ngZone.run(() => {
        const data = JSON.parse(event.data);
        this.radioFrequencySubject.next(data.frequency);
      });
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      this.connectToSSE();
    };
  }
}
