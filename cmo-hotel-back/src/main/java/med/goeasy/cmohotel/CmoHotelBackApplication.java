package med.goeasy.cmohotel;

import med.goeasy.cmohotel.config.ConfigProperties;
import med.goeasy.cmohotel.persistence.repository.AppRoleRepository;
import med.goeasy.cmohotel.persistence.repository.ReservationRepository;
import med.goeasy.cmohotel.presentation.dto.prices.PriceEstimationResponse;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservedRoomResponseDto;
import med.goeasy.cmohotel.security.enums.EPermissions;
import med.goeasy.cmohotel.security.enums.ERoleSystem;
import med.goeasy.cmohotel.service.ReservationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;

import java.time.LocalDateTime;
import java.util.List;

@EnableAsync
@EnableConfigurationProperties(ConfigProperties.class)
@SpringBootApplication
public class CmoHotelBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(CmoHotelBackApplication.class, args);
    }

    @Value("${spring.jpa.hibernate.ddl-auto}")
    private String ddl;

    @Value("${app.database.feed:false}") // Defaults to false if not provided
    private boolean shouldFeed;

    @Bean
    CommandLineRunner runner(Feeder feeder, ReservationService reservationService){
        return args -> {
            //reservationService.calculateOccupationStatistics().forEach(System.out::println);
            //reservationRepository.findOccupiedRangesByRoom(1L,LocalDateTime.now()).forEach(System.out::println);
            //PriceEstimationResponse price = reservationPricingService.calculateEstimationByCode(501L);
            //System.err.println(price);
            //feeder.seedMassiveReservations(500);
            //feeder.grantPermissionToRole(EPermissions.RESERVATION_UPDATE,ERoleSystem.ADMIN);
            //feeder.grantPermissionToRole(EPermissions.PRESTATION_UPDATE,ERoleSystem.ADMIN);
            //feeder.grantPermissionToRole(EPermissions.RESERVATION_MAIN_COURANTE,ERoleSystem.ADMIN);
            //feeder.grantPermissionToRole(EPermissions.ROOM_LIST_WITH_RESERVATION_DETAILS,ERoleSystem.ADMIN);
            //feeder.grantPermissionToRole(EPermissions.INVOICE_INVOICE_PDF,ERoleSystem.ADMIN);
            //feeder.grantPermissionToRole(EPermissions.RESERVATION_FICHE_PDF,ERoleSystem.ADMIN);
            //feeder.grantPermissionToRole(EPermissions.RESERVATION_TIME_EXTEND,ERoleSystem.ADMIN);
            //feeder.resetRolePermissions(ERoleSystem.NIGHT_AUDIT);
            /*feeder.createPrestationsAccounts(
                    r.findByName(ERoleSystem.RESERVATIONS_MANAGER.getRoleName()).get()
            );*/
            //feeder.generateMockInvoices(800);
            //Feed database0
            if (shouldFeed)
                feeder.feed();

        };
    }
}
