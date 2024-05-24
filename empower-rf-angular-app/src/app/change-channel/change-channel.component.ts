// change-channel.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule, ValidationErrors , AbstractControl, ValidatorFn} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import Filter from 'bad-words';
import { NgIf } from '@angular/common';//
//import { customNumberValidator } from './custom-number.validator'; // Adjust the path

function customNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) {
      return null; // Don't validate empty values to allow for required validators to handle them
    }

    const number = parseFloat(value);

    if (isNaN(number)) {
      return { invalidNumber: true };
    }

    const numberPattern = /^\d{1,3}\.\d{1}$/;
    if (!numberPattern.test(value)) {
      return { patternMismatch: true };
    }

    const integerPart = Math.floor(number);
    const decimalPart = Math.round((number - integerPart) * 10);

    if (integerPart < 80 || integerPart > 108) {
      return { outOfRange: true };
    }

    if (decimalPart % 2 === 0) {
      return { lastDigitNotOdd: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-change-channel',
  templateUrl: './change-channel.component.html',
  styleUrls: ['./change-channel.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, NgIf]

})
export class ChangeChannelComponent implements OnInit {
  profanityFilter = new Filter();
  nameControl = new FormControl('', [Validators.required, this.naughtyWordValidator()]);
  frequencyControl = new FormControl('', [Validators.required, customNumberValidator()]);
  

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  naughtyWordValidator(){
    return (control: FormControl): ValidationErrors | null => {
      const value = control.value?.toLowerCase();
      return this.profanityFilter.isProfane(value) ? { profanity: true } : null;
    };
  }

  formValid(): boolean {
    return this.nameControl.valid && this.frequencyControl.valid;
  }

  onSubmit(): void {
    if (this.formValid()) {
      const payload = {
        name: this.nameControl.value,
        channel: parseFloat(this.frequencyControl.value!)
      };
      this.http.post('/api/changeChannel', payload).subscribe(response => {
        console.log('Channel changed:', response);
      });
    }
  }
}
