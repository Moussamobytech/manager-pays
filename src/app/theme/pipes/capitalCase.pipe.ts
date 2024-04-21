import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalCase'
})
export class CapitalCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    let values:string = value.toLowerCase();
    // casser le string en mots et les transformer en capitalCase
    return values.replace(/\b\w/g, firstLetter => firstLetter.toUpperCase());
  }
}
