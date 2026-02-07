package med.goeasy.cmohotel;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.auth.AppPermission;
import med.goeasy.cmohotel.persistence.entity.auth.AppRole;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.persistence.repository.AppPermissionRepository;
import med.goeasy.cmohotel.persistence.repository.AppRoleRepository;
import med.goeasy.cmohotel.persistence.repository.AppUserRepository;
import med.goeasy.cmohotel.security.enums.EPermissions;
import med.goeasy.cmohotel.security.enums.ERoleSystem;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class Feeder {

    private final AppRoleRepository appRoleRepository;
    private final AppPermissionRepository appPermissionRepository;
    private final DataSource dataSource;
    private final PasswordEncoder encoder;
    private final AppUserRepository appUserRepository;

    @Transactional
    public void grantPermissionToRole(EPermissions permission,ERoleSystem role){
        Optional<AppRole> appRole =appRoleRepository.findByName(role.getRoleName());
        if (appRole.isEmpty()){
            log.warn("role with name {} does not exists", role.getRoleName());
            return;
        }

        AppPermission appPermission = appPermissionRepository.findByName(permission.getAuthority()).orElse(null);
        if (appPermission == null){
            appPermission = AppPermission.builder()
                    .name(permission.getAuthority())
                    .title(permission.getTitle())
                    .module(permission.getModule())
                    .groupe(permission.getGroup())
                    .description(permission.getDescription())
                    .affectable(permission.isAffectable())
                    .build();
            appPermission = appPermissionRepository.save(appPermission);
            log.warn("create new permission with name {}", permission.getAuthority());
        }

        appRole.get().getPermissions().add(appPermission);
        appRoleRepository.save(appRole.get());
        log.info("permission with name {} granted to role {}", permission.getAuthority(), role.getRoleName());
    }

    @Transactional
    public void resetRolePermissions(ERoleSystem role){
        Optional<AppRole> appRole =appRoleRepository.findByName(role.getRoleName());
        if (appRole.isEmpty()){
            log.warn("role with name {} does not exists", role.getRoleName());
            return;
        }
        role.getPermissions().forEach(permission->{
            grantPermissionToRole(permission,role);
        });
    }

    public void roles(){
        log.info("--> Start feed system roles & permissions");
        List<AppPermission> permissionList= new ArrayList<>();
        Arrays.stream(EPermissions.values())
                .forEach(p -> {
                    permissionList.add(
                            appPermissionRepository.save(
                                    AppPermission.builder()
                                            .name(p.getAuthority())
                                            .title(p.getTitle())
                                            .module(p.getModule())
                                            .groupe(p.getGroup())
                                            .affectable(p.isAffectable())
                                            .build())
                    );
                });
        log.info("-> {} permissions saved", permissionList.size());
        List<AppRole> roleList= new ArrayList<>();
        Arrays.stream(ERoleSystem.values())
                .forEach(role -> {
                    roleList.add(
                            appRoleRepository.save(
                                    AppRole.builder()
                                            .name(role.getRoleName())
                                            .title(role.getTitle())
                                            .permissions(
                                                    role.getPermissions().stream().map(p -> permissionList.stream().filter(l->l.getName().equals(p.getAuthority())).findFirst().orElse(null)).collect(Collectors.toSet())
                                            )
                                            .isSystem(true)
                                            .description(role.getDescription())
                                            .build())
                    );
                    ;
                });
        log.info("-> {} roles saved", roleList.size());
        createAdminAccount(
                roleList.stream()
                        .filter(r -> r.getName().equals(ERoleSystem.ADMIN.getRoleName()))
                        .findFirst()
                        .orElseThrow(()-> new BadRequestException("no role found with name " + ERoleSystem.ADMIN.getRoleName()))
        );
    }

    private void createAdminAccount(AppRole adminRole) {
        AppUser admin = new AppUser();
        admin.setUsername("admin");
        admin.setPassword(encoder.encode("admin"));
        admin.setAccountStatus(true);
        admin.setFirstName("admin");
        admin.setLastName("admin");
        admin.setRoles( Set.of(adminRole));
        appUserRepository.save(admin);
        log.info("admin account created");
    }

    @Transactional
    public void feed(){
        log.info("Feeder : start");
        ResourceDatabasePopulator resourceDatabasePopulator =
                new ResourceDatabasePopulator(
                        false,
                        false,
                        "UTF-8",
                        new ClassPathResource("data.sql")
                );
        resourceDatabasePopulator.execute(dataSource);
        log.info("--> data.sql file loaded");
        roles();
        log.info("Feeder : end");
    }
}
