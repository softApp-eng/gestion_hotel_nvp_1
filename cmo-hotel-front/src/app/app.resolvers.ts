import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import {forkJoin, of} from 'rxjs';
import {AuthService} from "./core/auth/auth.service";
import {UserService} from "./core/user/user.service";

export const initialDataResolver = () => {
    //const messagesService = inject(MessagesService);
    const navigationService = inject(NavigationService);
    //const notificationsService = inject(NotificationsService);
    //const quickChatService = inject(QuickChatService);
    //const shortcutsService = inject(ShortcutsService);
    const _userService = inject(UserService);
    const _authService = inject(AuthService);


    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([
        navigationService.get(),
        //messagesService.getAll(),
        //notificationsService.getAll(),
        //quickChatService.getChats(),
        //shortcutsService.getAll(),
        ( _authService.accessToken.length >0 && _authService.refreshToken.length >0 )?
            _userService.get():
            of(true)
    ]);
};
