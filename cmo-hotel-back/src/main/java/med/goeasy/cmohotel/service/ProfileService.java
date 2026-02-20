package med.goeasy.cmohotel.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.auth.AppPermission;
import med.goeasy.cmohotel.persistence.entity.auth.AppRole;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.persistence.repository.AppUserRepository;
import med.goeasy.cmohotel.presentation.dto.profile.ProfileUpdateDto;
import med.goeasy.cmohotel.presentation.dto.profile.UpdatePasswordDto;
import med.goeasy.cmohotel.presentation.dto.user.UserResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProfileService {

    private final PasswordEncoder encoder;
    private final AppUserRepository appUserRepository;

    private final ActivityLogService activityLogService;
    private final HttpServletRequest request;

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


    public void changeMyPassword(Authentication authentication, UpdatePasswordDto dto) {
        AppUser user = (AppUser) authentication.getPrincipal();
        if (!encoder.matches(dto.currentPassword(),  user.getPassword()))
            throw new BadRequestException("Ancien mot de passe est incorrect");

        user.setPassword(encoder.encode(dto.newPassword()));
        appUserRepository.save(user);

        activityLogService.logActivity(
                EAuditActionTarget.USER,
                EAuditActionOperation.UPDATE,
                String.format("'%s' a changé son mot de passe.",authentication.getName()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    public void updateProfile(Authentication authentication, ProfileUpdateDto dto) {
        AppUser user = (AppUser) authentication.getPrincipal();

        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        appUserRepository.save(user);
        activityLogService.logActivity(
                EAuditActionTarget.USER,
                EAuditActionOperation.UPDATE,
                String.format("'%s' a changé ses informations de profile.",authentication.getName()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }



}
