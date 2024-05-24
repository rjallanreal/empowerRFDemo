import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TitleComponent } from './title/title.component';
import { RadioFrequencyDisplayComponent } from './radio-frequency-display/radio-frequency-display.component';
import { RadioFrequencyService } from './radio-frequency.service';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { ChangeChannelComponent } from './change-channel/change-channel.component';
import {ChannelChangeTableComponent} from './channel-change-table/channel-change-table.component';

@Component({
  selector: 'empower-rf-app-root',
  standalone: true,
  imports: [RouterOutlet,
    TitleComponent,
    RadioFrequencyDisplayComponent,
    AudioPlayerComponent,
    ChangeChannelComponent,
    ChannelChangeTableComponent
  ],
  //providers: [RadioFrequencyService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'empower-rf-app';
}
