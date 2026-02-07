import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
    selector: '[hasAccountType]',
    standalone: true
})
export class HasAccountTypeDirective {

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private authService: AuthService
    ) {}

    @Input() set hasAccountType(hasAccountTypes: string[]) {
        this.viewContainer.clear();

        if (this.authService.accountTypeChecker(hasAccountTypes)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }
}
