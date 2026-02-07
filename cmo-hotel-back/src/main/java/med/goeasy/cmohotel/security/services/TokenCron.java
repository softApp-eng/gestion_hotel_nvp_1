package med.goeasy.cmohotel.security.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class TokenCron {

    private final TokenServiceFace tokenServiceFace;

    @Scheduled(cron = "${app.jwt-cron-expression}")
    public void scheduleFixedRateTask() {
        log.info("deleting invalid tokens");
        tokenServiceFace.deleteInvaldeTokens();
    }
}
