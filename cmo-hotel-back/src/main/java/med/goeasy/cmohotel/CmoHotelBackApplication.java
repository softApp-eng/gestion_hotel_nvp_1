package med.goeasy.cmohotel;

import med.goeasy.cmohotel.config.ConfigProperties;
import med.goeasy.cmohotel.persistence.repository.ReservationRepository;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservedRoomResponseDto;
import med.goeasy.cmohotel.security.enums.EPermissions;
import med.goeasy.cmohotel.security.enums.ERoleSystem;
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
    CommandLineRunner runner(Feeder feeder, ReservationRepository reservationRepository){
        return args -> {
//            List<ReservedRoomResponseDto> futureReservedRooms = reservationRepository.findFutureReservedRooms(LocalDateTime.now());
//            System.err.println(futureReservedRooms.size());
//            futureReservedRooms.forEach(System.out::println);
            //feeder.seedMassiveReservations(500);
            //feeder.grantPermissionToRole(EPermissions.RESERVATION_ONE,ERoleSystem.ADMIN);
            //feeder.grantPermissionToRole(EPermissions.ROOM_TYPE_DELETE,ERoleSystem.ADMIN);
            //feeder.resetRolePermissions(ERoleSystem.ADMIN);
            //Feed database0
            if (shouldFeed)
                feeder.feed();

        };
    }
}
