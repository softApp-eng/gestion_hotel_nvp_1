package med.goeasy.cmohotel;

import med.goeasy.cmohotel.config.ConfigProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;

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
    CommandLineRunner runner(Feeder feeder){
        return args -> {
            //feeder.feed();
            //feeder.grantPermissionToRole(EPermissions.ASSISTANCE_CONSOLIDATION_REPORT_EXCEL_DOWNLOAD,ERoleSystem.ADMIN);
            //feeder.grantPermissionToRole(EPermissions.CALLS_CASE_UPDATE,ERoleSystem.BCC);
            //feeder.resetRolePermissions(ERoleSystem.ADMIN);
            //Feed database
            if (shouldFeed)
                feeder.feed();

        };
    }
}
