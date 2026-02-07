package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@RequiredArgsConstructor
@Service
public class UsersService {

    private final AppUserRepository appUserRepository;
    private final AppRoleRepository appRoleRepository;
    private final PasswordEncoder encoder;

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
    public void register(RegisterRequestDto dto){
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
        log.info("new user <{}> registered", user.getUsername());
    }

    @Transactional
    public void update(UpdateUserRequestDto dto, String userid) {

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
        log.info("user <{}> updated", user.getUsername());
    }

    @Transactional
    public void updatePassword(UpdateUserPasswordDto dto, String userid) {

        AppUser user = getUser(userid);
        user.setPassword(encoder.encode(dto.password()));
        appUserRepository.save(user);
        log.info("user <{}> password updated", user.getUsername());
    }

    @Transactional
    public void assignRoles(UserRoleAssign dto){
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
        log.info("Roles for user <{}> updated", user.getUsername());
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
