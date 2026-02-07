import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    standalone: true,
    name: 'highlight',
})
export class HighlightPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(value: string, search: string): SafeHtml {
        if (!search || !value) return value;

        const pattern = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(pattern, 'gi');
        const result = value.replace(regex, (match) => `<mark>${match}</mark>`);

        return this.sanitizer.bypassSecurityTrustHtml(result);
    }
}
