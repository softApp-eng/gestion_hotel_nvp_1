import { Directive, Input, HostBinding, OnInit } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
    selector: '[disableIfNoPermission]',
    standalone: true
})
export class DisableIfNoPermissionDirective implements OnInit {
    @Input('disableIfNoPermission') permissions: string[] = [];

    // Lie automatiquement la propriété 'disabled' de l'élément au résultat du booléen
    @HostBinding('disabled') isDisabled: boolean = false;

    constructor(private _authService: AuthService) {}

    ngOnInit(): void {
        this.isDisabled = !this._authService.permissionChecker(this.permissions);
    }
}
