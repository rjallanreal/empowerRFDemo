import { Component, OnInit } from '@angular/core';
import { RadioFrequencyService } from '../radio-frequency.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-radio-display',
  templateUrl: './radio-frequency-display.component.html',
  standalone: true,
  providers: [RadioFrequencyService],
  imports: [
    MatCardModule,
    CommonModule,
  ],
  styleUrls: ['./radio-frequency-display.component.css']
})
export class RadioFrequencyDisplayComponent implements OnInit {

  radioFrequency: string = '';

  constructor(private radioService: RadioFrequencyService) { }

  ngOnInit(): void {
    this.radioService.radioFrequency$.subscribe(
      frequency => this.radioFrequency = frequency
    );
  }

}