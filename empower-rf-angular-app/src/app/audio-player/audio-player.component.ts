// audio-player.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Hls from 'hls.js';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule]
})
export class AudioPlayerComponent implements OnInit {
  @ViewChild('audio', { static: true }) audio!: ElementRef<HTMLAudioElement>;
  @ViewChild('oscilloscope', { static: true }) oscilloscope!: ElementRef<HTMLCanvasElement>;

  isPlaying = false;
  isSetup = false;

  private audioSrc: string = 'index.m3u8'; // Replace with your HLS URL
  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private animationId!: number;

  constructor() {}

  ngOnInit(): void {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(this.audioSrc);
      hls.attachMedia(this.audio.nativeElement);
      // hls.on(Hls.Events.MANIFEST_PARSED, () => {
      //   this.setupAudioProcessing();
      // });
    } else if (this.audio.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari and other browsers that support HLS natively
      this.audio.nativeElement.src = this.audioSrc;
      // this.audio.nativeElement.addEventListener('canplay', () => {
      //   this.setupAudioProcessing();
      // });
    }
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.audio.nativeElement.pause();
      cancelAnimationFrame(this.animationId);
    } else {
      this.audio.nativeElement.play();
      if (this.isSetup) {
        this.drawOscilloscope();
      }
      else {
        this.setupAudioProcessing();
      }
    }
    this.isPlaying = !this.isPlaying;
  }

  setupAudioProcessing(): void {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = this.audioContext.createMediaElementSource(this.audio.nativeElement);
    this.analyser = this.audioContext.createAnalyser();
    const destination = this.audioContext.createMediaStreamDestination();

    source.connect(this.analyser);
    source.connect(destination);
    source.connect(this.audioContext.destination);
    this.isSetup = true;
    this.drawOscilloscope();
  }
  drawOscilloscope(): void {
    const canvas = this.oscilloscope.nativeElement;
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) return;

    const bufferLength = this.analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.analyser.getByteTimeDomainData(dataArray);
      canvasContext.fillStyle = 'rgb(0, 0, 0)';
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = 'rgb(0, 255, 0)';
      canvasContext.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();

      this.animationId = requestAnimationFrame(draw);
    };

  draw();
  }
}
