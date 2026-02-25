package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.persistence.entity.AppConfiguration;
import med.goeasy.cmohotel.utils.DynamicJobService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/administration")
@RestController
public class AdministrationController {

    private final DynamicJobService dynamicJobService;

    @PostMapping("/room/clean/cron")
    public ResponseEntity<Void> updateCron(
            Authentication authentication,
            @Valid @NotEmpty(message = "heure de planification requise") @RequestParam() String time
    ) {
        // update cron time in db
        dynamicJobService.updateCronTime(authentication, time);
        // Relancer la planification
        dynamicJobService.refreshSchedule();

        return ResponseEntity.ok().build();
    }

    @GetMapping("/load-config")
    ResponseEntity<AppConfiguration> loadCurrentSettings(){
        return ResponseEntity.ok(dynamicJobService.getCurrentAppConfiguration());
    }




}
