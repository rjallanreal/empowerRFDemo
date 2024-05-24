import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogService, ChannelChange } from '../log.service';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channel-change-table',
  templateUrl: './channel-change-table.component.html',
  standalone: true,
  imports: [MatTableModule, MatCardModule, CommonModule],
  styleUrls: ['./channel-change-table.component.css']
})
export class ChannelChangeTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'frequency', 'dateTime'];
  dataSource: ChannelChange[] = [];
  private logSubscription: Subscription | null = null; // Initialize with null

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.logSubscription = this.logService.getLogUpdates().subscribe({
      next: (updates: ChannelChange[]) => {
        this.dataSource = updates;
      },
      error: error => {
        console.error('Error receiving log updates', error);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.logSubscription) {
      this.logSubscription.unsubscribe();
    }
  }
}
