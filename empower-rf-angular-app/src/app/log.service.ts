import { Injectable, NgZone } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { retryWhen, switchMap } from 'rxjs/operators';

export interface ChannelChange {
  name: string;
  frequency: number;
  dateTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'api/getLog'; // Replace with your API URL
  private reconnectInterval = 5000; // 5 seconds

  constructor(private zone: NgZone) {}

  getLogUpdates(): Observable<ChannelChange[]> {
    return new Observable<ChannelChange[]>(observer => {
      let eventSource: EventSource;

      const createEventSource = () => {
        eventSource = new EventSource(this.apiUrl);

        eventSource.onmessage = (event) => {
          this.zone.run(() => {
            try {
              const data: any = JSON.parse(event.data);
              if (Array.isArray(data)) {
                // Convert dateTime strings to Date objects
                const parsedData: ChannelChange[] = data.map(item => ({
                  ...item,
                  dateTime: new Date(item.dateTime)
                }));
                observer.next(parsedData);
              } else {
                throw new Error('Data is not an array');
              }
            } catch (error) {
              observer.error(error);
            }
          });
        };

        eventSource.onerror = (error) => {
          this.zone.run(() => {
            observer.error(error);
            eventSource.close();
          });
        };
      };

      createEventSource();

      return () => {
        if (eventSource) {
          eventSource.close();
        }
      };
    }).pipe(
      retryWhen(errors =>
        errors.pipe(
          switchMap((error) => {
            console.error('Error occurred, retrying...', error);
            return timer(this.reconnectInterval);
          })
        )
      )
    );
  }
}
