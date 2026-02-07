import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
    selector: '[hasPermission]',
    standalone: true
})
export class HasPermissionDirective {

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private authService: AuthService
    ) {}

    @Input() set hasPermission(authorizedPermissions: string[]) {
        this.viewContainer.clear();

        if (this.authService.permissionChecker(authorizedPermissions)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }
}
