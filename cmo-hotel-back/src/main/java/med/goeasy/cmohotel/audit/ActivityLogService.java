package med.goeasy.cmohotel.audit;

import jakarta.servlet.http.HttpServletRequest;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ActivityLogService {

    private final ActivityLogRepository repository;

    @Async
    public void logActivity(EAuditActionTarget actionTarget,EAuditActionOperation actionOperation, String message, String clientIp,String currentUser) {
        log.info(
                "{} :: ({},{}), {}",
                currentUser,
                actionTarget.getName(),
                actionOperation.getName(),
                message
        );
        ActivityLog log = ActivityLog.builder()
                .actionTarget(actionTarget)
                .actionOperation(actionOperation)
                .message(message)
                .username(currentUser)
                .timestamp(LocalDateTime.now())
                .ipAddress(clientIp)
                .build();

        repository.save(log);
    }

    public Page<ActivityLog> search(String key, List<String> usernames, List<EAuditActionTarget> targets, List<EAuditActionOperation> operations, LocalDate start, LocalDate end, Integer page, Integer size){

        return repository.search(
                key,
                targets.isEmpty()? null:targets,
                operations.isEmpty()? null:operations,
                (usernames == null || usernames.isEmpty()) ? null : usernames,
                start != null ? start.atStartOfDay() : null,
                start != null ? end.atTime(23, 59, 59) : null,
                start != null,
                PageRequest.of(page, size)
                );
    }

    public List<EAuditActionOperation> getActionOperations() {
        return Arrays.stream(EAuditActionOperation.values())
                .sorted(Comparator.comparing(EAuditActionOperation::getName))
                .toList();
    }

    public List<EAuditActionTarget> getActionTargets() {
        return Arrays.stream(EAuditActionTarget.values())
                .sorted(Comparator.comparing(EAuditActionTarget::getName))
                .toList();
    }

    public List<String> getAccount() {
        return repository.getAccount();
    }

    public String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getHeader("X-Forwarded-For");
        if (remoteAddr == null || remoteAddr.isEmpty()) {
            remoteAddr = request.getRemoteAddr();
        }
        return remoteAddr;
    }
}
