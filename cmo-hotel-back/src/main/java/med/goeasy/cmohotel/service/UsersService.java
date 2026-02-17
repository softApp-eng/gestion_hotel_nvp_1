package med.goeasy.cmohotel.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.exception.OperationNotPermittedException;
import med.goeasy.cmohotel.persistence.entity.auth.AppRole;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.persistence.repository.AppRoleRepository;
import med.goeasy.cmohotel.persistence.repository.AppUserRepository;
import med.goeasy.cmohotel.presentation.dto.user.*;
import med.goeasy.cmohotel.security.enums.ERoleSystem;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class UsersService {

    private final AppUserRepository appUserRepository;
    private final AppRoleRepository appRoleRepository;
    private final PasswordEncoder encoder;
    private final ActivityLogService activityLogService;
    private final HttpServletRequest request;

    public List<UserResponse> list(Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        log.info("{} get user list", user.getUsername());
        return appUserRepository.findAll(Sort.by("username"))
                .stream().map(UserResponse::mapToDto).toList();
    }

    public UserResponse one(String userid, Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        log.info("{} get user", user.getUsername());
        AppUser appUser = appUserRepository.findById(userid).orElse(null);
        return UserResponse.mapToDto(appUser);
    }

    @Transactional
    public void register(Authentication authentication, RegisterRequestDto dto){
        if (appUserRepository.existsByUsername(dto.username()))
            throw new OperationNotPermittedException("Nom d'utilisateur déja existe");

        AppUser user = new AppUser();
        user.setUsername(dto.username());
        user.setPassword(encoder.encode(dto.password()));
        user.setAccountStatus(dto.status());
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        user.setRoles( Set.of(getDefaultRole()));
        user.setSystem(false);
        appUserRepository.save(user);
        activityLogService.logActivity(
                EAuditActionTarget.USER,
                EAuditActionOperation.CREATE,
                String.format("Création d'un nouveau compte utilisateur : '%s' (%s %s). Statut initial : %s.",
                        user.getUsername(), user.getFirstName(), user.getLastName(), user.getAccountStatus()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void update(Authentication authentication, UpdateUserRequestDto dto, String userid) {

        if (appUserRepository.existsByUsernameAndIdIsNot(dto.username(),userid))
            throw new OperationNotPermittedException("Nom d'utilisateur déja existe");

        AppUser user = getUser(userid);
        if (user.isSystem()) {
            throw new OperationNotPermittedException("utilisateur systeme non modifiable");
        }
        user.setUsername(dto.username());
        user.setAccountStatus(dto.status());
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        appUserRepository.save(user);
        activityLogService.logActivity(
                EAuditActionTarget.USER,
                EAuditActionOperation.UPDATE,
                String.format("Mise à jour du profil utilisateur '%s' (id: %s).",
                        user.getUsername(), user.getId()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void updatePassword(Authentication authentication, UpdateUserPasswordDto dto, String userid) {

        AppUser user = getUser(userid);
        user.setPassword(encoder.encode(dto.password()));
        appUserRepository.save(user);
        activityLogService.logActivity(
                EAuditActionTarget.USER,
                EAuditActionOperation.UPDATE,
                String.format("Réinitialisation du mot de passe pour l'utilisateur '%s'.", user.getUsername()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void assignRoles(Authentication authentication, UserRoleAssign dto){
        AppUser user = getUser(dto.userid());
        if (user.isSystem()) {
            throw new OperationNotPermittedException("utilisateur systeme non modifiable");
        }
        Set<AppRole> appRoles = new HashSet<>();
        if (dto.roles() != null && !dto.roles().isEmpty()) {
            dto.roles().forEach(roleID -> {
                appRoles.add(
                        appRoleRepository.findById(roleID)
                                .orElseThrow(()-> new BadRequestException("role n'existe pas"))
                );
            });
        }

        user.setRoles(appRoles);
        appUserRepository.save(user);
        String rolesList = appRoles.stream().map(AppRole::getTitle).collect(Collectors.joining(", "));
        activityLogService.logActivity(
                EAuditActionTarget.USER,
                EAuditActionOperation.UPDATE,
                String.format("Modification des accès pour '%s'. Nouveaux rôles assignés : [%s].",
                        user.getUsername(), rolesList.isEmpty() ? "Aucun" : rolesList),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }


    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    private AppRole getDefaultRole(){
        return appRoleRepository.findByName(ERoleSystem.DEFAULT.getRoleName())
                .orElseThrow(()-> new BadRequestException("Default role n'existe pas"));
    }

    private AppUser getUser(String userID){
        return appUserRepository.findById(userID)
                .orElseThrow(()-> new BadRequestException("Utilisateur n'existe pas"));
    }
}
