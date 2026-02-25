package med.goeasy.cmohotel;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.*;
import med.goeasy.cmohotel.persistence.entity.auth.AppPermission;
import med.goeasy.cmohotel.persistence.entity.auth.AppRole;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.persistence.entity.auth.AppUserResource;
import med.goeasy.cmohotel.persistence.entity.enums.EGuestRole;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.persistence.repository.*;
import med.goeasy.cmohotel.security.enums.EPermissions;
import med.goeasy.cmohotel.security.enums.ERoleSystem;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    private final ReservationDetailsRepository detailsRepository;
    private final PersonRepository personRepository;
    private final RoomRepository roomRepository;
    private final AppUserResourceRepository appUserResourceRepository;
    private final AppConfigurationRepository appConfigurationRepository;

    private void initInitialConfiguration(){
        AppConfiguration appConfiguration = new AppConfiguration();
        appConfiguration.setAutoCleaningRoomTimeCronExpression("0 1 1 * * ?"); // at 01:01
        appConfiguration.setCheckin(LocalTime.of(12,0));
        appConfigurationRepository.save(appConfiguration);
        log.info("Init initial configuration");
    }

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

        // create users
        createAdminAccount(
                roleList.stream()
                        .filter(r -> r.getName().equals(ERoleSystem.ADMIN.getRoleName()))
                        .findFirst()
                        .orElseThrow(()-> new BadRequestException("no role found with name " + ERoleSystem.ADMIN.getRoleName()))
        );

        createGovernanceAccounts(
                roleList.stream()
                        .filter(r -> r.getName().equals(ERoleSystem.GOVERNANCE.getRoleName()))
                        .findFirst()
                        .orElseThrow(()-> new BadRequestException("no role found with name " + ERoleSystem.GOVERNANCE.getRoleName()))
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

    private void createGovernanceAccounts(AppRole governanceRole) {
        Long OUDAIA_PAVILLON_ID = 1L;
        Long CHELLAH_PAVILLON_ID = 2L;
        List<Room> chellahRooms = roomRepository.getRooms(CHELLAH_PAVILLON_ID,null);
        List<Room> oudayaRooms = roomRepository.getRooms(OUDAIA_PAVILLON_ID,null);

        //save chellah governance
        AppUser governanceChellah = new AppUser();
        governanceChellah.setUsername("gouv_chellah");
        governanceChellah.setPassword(encoder.encode("123456"));
        governanceChellah.setAccountStatus(true);
        governanceChellah.setFirstName("chellah");
        governanceChellah.setLastName("chellah");
        governanceChellah.setRoles( Set.of(governanceRole));
        appUserRepository.save(governanceChellah);
        AppUserResource resource = new AppUserResource();
        resource.setUser(governanceChellah);
        resource.setRooms(
                new HashSet<>(chellahRooms)
        );
        appUserResourceRepository.save(resource);
        log.info("governant chellah account created");

        //save OUDAYA governance
        AppUser governanceOudaya = new AppUser();
        governanceOudaya.setUsername("gouv_oudaya");
        governanceOudaya.setPassword(encoder.encode("123456"));
        governanceOudaya.setAccountStatus(true);
        governanceOudaya.setFirstName("oudaya");
        governanceOudaya.setLastName("oudaya");
        governanceOudaya.setRoles( Set.of(governanceRole));
        appUserRepository.save(governanceOudaya);
        AppUserResource resourceOudaya = new AppUserResource();
        resourceOudaya.setUser(governanceOudaya);
        resourceOudaya.setRooms(
                new HashSet<>(oudayaRooms)
        );
        appUserResourceRepository.save(resourceOudaya);
        log.info("governant oudaya account created");
    }

    @Transactional
    public void seedMassiveReservations(int count) {
        List<Person> allPersons = personRepository.findAll();
        List<Room> allRooms = roomRepository.findAll();

        if (allPersons.isEmpty() || allRooms.isEmpty()) {
            throw new RuntimeException("Données de base manquantes (Personnes/Chambres)");
        }

        Random random = new Random();
        EReservationStatus[] statuses = EReservationStatus.values();
        EReservationCategory[] categories = EReservationCategory.values();
        EGuestRole[] roles = EGuestRole.values();

        for (int i = 0; i < count; i++) {
            // Choix d'un statut aléatoire
            EReservationStatus randomStatus = statuses[random.nextInt(statuses.length)];

            // Dates cohérentes mais aléatoires (entre aujourd'hui et +60 jours)
            int startDaysOffset = random.nextInt(60);
            LocalDateTime start = LocalDateTime.now().plusDays(startDaysOffset);
            LocalDateTime end = start.plusDays(1 + random.nextInt(10));

            ReservationDetails details = ReservationDetails.builder()
                    .category(categories[random.nextInt(categories.length)])
                    .status(randomStatus)
                    .plannedStart(start)
                    .plannedEnd(end)
                    .checkin(start)
                    .checkout(randomStatus == EReservationStatus.CONFIRMED ? null : end)
                    .observation("Test automatique #" + i)
                    .reservations(new ArrayList<>())
                    .build();

            // Génération de 1 à 3 personnes par dossier de réservation
            int partySize = 1 + random.nextInt(3);
            for (int j = 0; j < partySize; j++) {
                Reservation res = Reservation.builder()
                        .details(details)
                        .person(allPersons.get(random.nextInt(allPersons.size())))
                        .room(allRooms.get(random.nextInt(allRooms.size())))
                        .role(j == 0 ? EGuestRole.PRINCIPAL : EGuestRole.VICE)
                        //.checkin(start)
                        //.checkout(end)
                        .build();

                details.getReservations().add(res);
            }

            detailsRepository.save(details);
        }
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
        initInitialConfiguration();
        log.info("--> data.sql file loaded");
        roles();
        seedMassiveReservations(100);
        log.info("Feeder : end");
    }
}
