package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.persistence.entity.auth.AppPermission;
import med.goeasy.cmohotel.persistence.entity.auth.AppRole;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.presentation.dto.user.UserResponse;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProfileService {

    public UserResponse getShortUserInfo(Authentication authentication, Boolean expandRoles, Boolean expandPermissions) {
        AppUser user = (AppUser) authentication.getPrincipal();
        log.info("get profile infos for {}", user.getUsername());
        Set<String> roles = null;
        Set<String> permissions = null;
        if(expandRoles)
            roles = user.getRoles() == null ? Set.of() :
                    user.getRoles().stream().map(AppRole::getName).collect(Collectors.toSet());
        if(expandPermissions)
            permissions = user.getPermissions() == null ? Set.of() :
                    user.getPermissions().stream().map(AppPermission::getName).collect(Collectors.toSet());
        return UserResponse.builder()
                .userid(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatar(user.getAvatar())
                .roles(roles)
                .permissions(permissions)
                .build();
    }


}
