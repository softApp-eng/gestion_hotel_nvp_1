package med.goeasy.cmohotel.audit;

import jakarta.servlet.http.HttpServletRequest;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@RequiredArgsConstructor
@Service
public class ActivityLogService {

    private final ActivityLogRepository repository;

    @Async
    public void logActivity(EAuditActionTarget actionTarget,EAuditActionOperation actionOperation, String message, String clientIp,String currentUser) {
//        String currentUser = (SecurityContextHolder.getContext().getAuthentication() != null ?
//                        SecurityContextHolder.getContext().getAuthentication().getName() : "SYSTEM");

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

    public String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getHeader("X-Forwarded-For");
        if (remoteAddr == null || remoteAddr.isEmpty()) {
            remoteAddr = request.getRemoteAddr();
        }
        return remoteAddr;
    }
}
