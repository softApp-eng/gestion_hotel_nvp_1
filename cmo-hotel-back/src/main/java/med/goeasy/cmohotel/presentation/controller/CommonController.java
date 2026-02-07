package med.goeasy.cmohotel.presentation.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.persistence.entity.Grade;
import med.goeasy.cmohotel.service.CommonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/common")
@RestController
public class CommonController {

    private final CommonService commonService;

    @GetMapping("/grades")
    ResponseEntity<List<Grade>> grades(){
        return ResponseEntity.ok(commonService.getGrades());
    }

}
