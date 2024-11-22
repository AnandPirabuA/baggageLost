import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function differentOriginDestinationValidator(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const origin = form.get('origin')?.value;
    const destination = form.get('destination')?.value;

    if (origin && destination && origin === destination) {
      return { sameValue: true };
    }

    return null;
  };
}
