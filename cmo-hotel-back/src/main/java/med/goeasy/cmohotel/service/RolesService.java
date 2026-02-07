package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.auth.AppPermission;
import med.goeasy.cmohotel.persistence.entity.auth.AppRole;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.persistence.repository.AppPermissionRepository;
import med.goeasy.cmohotel.persistence.repository.AppRoleRepository;
import med.goeasy.cmohotel.persistence.repository.AppUserRepository;
import med.goeasy.cmohotel.presentation.dto.role.PermissionDto;
import med.goeasy.cmohotel.presentation.dto.role.RoleRequestDto;
import med.goeasy.cmohotel.presentation.dto.role.RoleResponse;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class RolesService {

    private final AppUserRepository appUserRepository;
    private final AppRoleRepository appRoleRepository;
    private final AppPermissionRepository appPermissionRepository;

    public List<RoleResponse> list(Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        log.info("{} get roles list", user.getUsername());
        return appRoleRepository.getAllRoles()
                .stream().map(RoleResponse::mapToDtoWithPermissions).toList();
    }

    // create role
    @Transactional
    public void createRole(RoleRequestDto dto){
        if (appRoleRepository.existsByTitle(dto.title()))
            throw new BadRequestException("nom deja existe");
        List<AppPermission> permissions = appPermissionRepository.findAllById(dto.permissions());
        if (permissions.stream().anyMatch(p -> !p.isAffectable())) {
            throw new BadRequestException("Permissions contient un  non-affectable permission.");
        }

        AppRole role = AppRole.builder()
                .name(generateName(dto.title()))
                .title(dto.title())
                .description(dto.description())
                .isSystem(false)
                .permissions(new HashSet<>(permissions))
                .build();
        appRoleRepository.save(role);
        log.info("new role created with name {}",role.getName());
    }

    // update role
    @Transactional
    public void updateRole(RoleRequestDto dto,String roleid){
        AppRole role = getRoleById(roleid);
        if (role.isSystem())
            throw new BadRequestException("Role système ne peut pas être modifié");
        if (appRoleRepository.existsByTitleAndIdNot(dto.title(),roleid))
            throw new BadRequestException("nom deja existe");

        List<AppPermission> permissions = appPermissionRepository.findAllById(dto.permissions());
        if (permissions.stream().anyMatch(p -> !p.isAffectable())) {
            throw new BadRequestException("Permissions contient un  non-affectable permission.");
        }
        role.setName(generateName(dto.title()));
        role.setTitle(dto.title());
        role.setDescription(dto.description());
        role.setPermissions(new HashSet<>(permissions));
        appRoleRepository.save(role);
        log.info("role with id {} updated",role.getId());
    }

    @Transactional
    public void cloneRole(String roleid){
        AppRole original = getRoleById(roleid);

        String baseName = original.getName() + "_CLONE";
        String baseTitle = original.getTitle() + " (Copie)";

        String finalName = baseName;
        String finalTitle = baseTitle;
        int counter = 1;

        while (appRoleRepository.existsByNameOrTitle(finalName,finalTitle)) {
            finalName = baseName + "_" + counter;
            finalTitle = baseTitle + " " + counter;
            counter++;
        }

        AppRole clonedRole = AppRole.builder()
                .name(finalName)
                .title(finalTitle)
                .description("Copie du rôle " + original.getTitle()+".")
                .isSystem(false)
                .permissions(new HashSet<>(original.getPermissions()))
                .build();

        appRoleRepository.save(clonedRole);
        log.info("clone of role {} created",original.getName());
    }
    // get role by id
    public RoleResponse roleById(String roleid){
        log.info("get role with id {}",roleid);
        return RoleResponse.mapToDtoWithPermissions(getRoleById(roleid));
    }

    // list permissions
    public List<PermissionDto> listPermissions(){
        log.info("load permissions");
        return appPermissionRepository.getAffectablePermissions().stream().map(PermissionDto::mapToDto).collect(Collectors.toList());
    }
    // delete role
    @Transactional
    public void deleteRole(String roleId) {
        AppRole role = getRoleById(roleId);
        if (role.isSystem())
            throw new BadRequestException("Role système ne peut pas être modifié");

        List<AppUser> usersWithRole = appUserRepository.findAllByRolesContaining(role);

        for (AppUser user : usersWithRole) {
            user.getRoles().remove(role);
        }

        appUserRepository.saveAll(usersWithRole);
        appRoleRepository.delete(role);
        log.info("role with id {} and name {} deleted",role.getId(),role.getName());
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    private String generateName(String name){
        if (name == null || name.isEmpty())
            return null;
        return "ROLE_" + name.toUpperCase().replaceAll(" ", "_");
    }
    private AppRole getRoleById(String id){
        return appRoleRepository.findById(id).orElseThrow(()->new BadRequestException("Role introuvable"));
    }
}
