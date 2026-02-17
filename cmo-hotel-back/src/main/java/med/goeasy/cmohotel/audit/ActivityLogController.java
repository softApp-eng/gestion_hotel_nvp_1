package med.goeasy.cmohotel.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/audit/logs")
@RestController
public class ActivityLogController {

  private final ActivityLogService activityLogService;

  @GetMapping("/search")
  ResponseEntity<Page<ActivityLog>> search(
          @RequestParam(required = false, defaultValue = "") String key,
          @RequestParam(required = false, defaultValue = "") List<String> usernames,
          @RequestParam(required = false) List<String> targets,
          @RequestParam(required = false) List<String> operations,
          @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate start,
          @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate end,
          @RequestParam(required = false, defaultValue = "0") Integer page,
          @RequestParam(required = false, defaultValue = "20") Integer size
  ){
    List<EAuditActionTarget> eTargets = new ArrayList<>();
    if (targets != null && !targets.isEmpty()) {
      targets.forEach((t) -> {
        if (!EnumUtils.isValidEnum(EAuditActionTarget.class, t))
          throw new BadRequestException("invalid target : " + t);
        eTargets.add(EAuditActionTarget.valueOf(t));
      });
    }

    List<EAuditActionOperation> eOperations = new ArrayList<>();
    if (operations != null && !operations.isEmpty()) {
      operations.forEach((o) -> {
        if (!EnumUtils.isValidEnum(EAuditActionOperation.class, o))
          throw new BadRequestException("invalid operation : " + o);
        eOperations.add(EAuditActionOperation.valueOf(o));
      });
    }

    return ResponseEntity.ok(
            activityLogService.search(
                    key,
                    usernames,
                    eTargets,
                    eOperations,
                    start,
                    end,
                    page, size
    ));
  }

  @GetMapping("/targets")
  ResponseEntity<List<EAuditActionTarget>> actionTargets(){
    return ResponseEntity.ok(activityLogService.getActionTargets());
  }

  @GetMapping("/operations")
  ResponseEntity<List<EAuditActionOperation>> actionOperations(){
    return ResponseEntity.ok(activityLogService.getActionOperations());
  }

  @GetMapping("/accounts")
  ResponseEntity<List<String>> getAccount(){
    return ResponseEntity.ok(activityLogService.getAccount());
  }

}
