package med.goeasy.cmohotel.utils;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.persistence.entity.AppConfiguration;
import med.goeasy.cmohotel.persistence.repository.AppConfigurationRepository;
import med.goeasy.cmohotel.persistence.repository.RoomRepository;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.concurrent.ScheduledFuture;

@Slf4j
@RequiredArgsConstructor
@Service
public class DynamicJobService {

    private final TaskScheduler taskScheduler;
    private final AppConfigurationRepository configRepo;
    private final RoomRepository roomRepository;
    private ScheduledFuture<?> scheduledTask;
    private final ActivityLogService activityLogService;
    private final HttpServletRequest request;

    // S'exécute au démarrage de l'application
    @EventListener(ContextRefreshedEvent.class)
    public void scheduleFromDb() {
        refreshSchedule();
    }

    public AppConfiguration getCurrentAppConfiguration() {
        return configRepo.findById(1L)
                .orElseThrow(()-> new IllegalStateException("No configuration found"));
    }

    public void refreshSchedule() {
        // 1. Annuler la tâche existante si elle existe
        if (scheduledTask != null) {
            scheduledTask.cancel(false);
        }

        // 2. Récupérer la nouvelle valeur en DB
        String cron = configRepo.findById(1L)
                .map(AppConfiguration::getAutoCleaningRoomTimeCronExpression)
                .orElse("0 0 0 * * *"); // Valeur par défaut

        // 3. Programmer la nouvelle tâche
        scheduledTask = taskScheduler.schedule(
                this::executeJob,
                new CronTrigger(cron)
        );

        log.info("Prochaine exécution planifiée auto cleaning room à : " + cron);
    }

    public void updateCronTime(Authentication authentication, String time){
        String cronExpression = convertToDailyCron(time);
        AppConfiguration config = configRepo.findById(1L).orElse(new AppConfiguration());
        config.setAutoCleaningRoomTimeCronExpression(cronExpression);
        configRepo.save(config);
        refreshSchedule();
        activityLogService.logActivity(
                EAuditActionTarget.CONFIGURATION,
                EAuditActionOperation.UPDATE,
                "Modifier la planification du temps de auto ménage des chambres : " + LocalDateTime.now(),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    protected void executeJob() {
        roomRepository.makeAllRoomsDirty();
        activityLogService.logActivity(
                EAuditActionTarget.JOB_SYSTEM,
                EAuditActionOperation.SYSTEM,
                "Exécution du job auto cleaning room à : " + LocalDateTime.now(),
                "system",
                "SYSTEM"
        );
        log.info("Exécution du job auto cleaning room à : " + LocalDateTime.now());
    }

    protected String convertToDailyCron(LocalTime time) {
        return String.format("0 %d %d * * *",
                time.getMinute(),
                time.getHour()
        );
    }

    /**
     * Parse une String HH:mm et retourne le Cron
     */
    protected String convertToDailyCron(String timeStr) {
        // Supporte les formats "14:30" ou "14:30:00"
        LocalTime time = LocalTime.parse(timeStr);
        return convertToDailyCron(time);
    }

    public void updateCheckoutValue(Authentication authentication, String time){
        AppConfiguration config = configRepo.findById(1L).orElse(new AppConfiguration());
        config.setCheckoutTime(LocalTime.parse(time));
        configRepo.save(config);
        activityLogService.logActivity(
                EAuditActionTarget.CONFIGURATION,
                EAuditActionOperation.UPDATE,
                "Modifier l'heure de check out'",
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }
}
