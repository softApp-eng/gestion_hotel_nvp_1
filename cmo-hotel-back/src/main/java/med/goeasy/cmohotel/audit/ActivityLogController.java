package med.goeasy.cmohotel.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

  private final ActivityLogRepository activityLogRepository;

  @GetMapping("/search")
  ResponseEntity<List<ActivityLog>> search(
  ){

    return ResponseEntity.ok(
            activityLogRepository.findAll(
                    Sort.by(Sort.Direction.DESC, "timestamp")
            ));
  }

  /*@GetMapping("/search")
  ResponseEntity<Page<ActivityLog>> search(
          @RequestParam(required = false, defaultValue = "") String key,
          @RequestParam(required = false, defaultValue = "") String username,
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
        if (!EnumUtils.isValidEnum(EReservationStatus.class, o))
          throw new BadRequestException("invalid operation : " + o);
        eOperations.add(EAuditActionOperation.valueOf(o));
      });
    }

    return ResponseEntity.ok(
            activityLogRepository.search(
                    key,
                    eTargets.isEmpty()? null:eTargets,
                    eOperations.isEmpty()? null:eOperations,
                    username,
                    start != null ? start.atStartOfDay() : null,
                    start != null ? end.atTime(23, 59, 59) : null,
                    PageRequest.of(page, size)
    ));
  }*/

}
