package med.goeasy.cmohotel.presentation.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.service.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/statistics")
@RestController
public class StatisticsController {

    private final StatisticsService statisticsService;


    @GetMapping("/finance/counts")
    ResponseEntity<Map<String, Long>> getFinancialStatistics(
            Authentication authentication
    ){
        return ResponseEntity.ok(statisticsService.getFinancialStatistics(authentication));
    }

    @GetMapping("/finance/monthly/revenue")
    ResponseEntity<Map<Integer, Double>> getMonthlyRevenueMap(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) List<String> paymentModes,
            @RequestParam(required = false) List<String> categories
    ){
        if (year == null){
            year = LocalDate.now().getYear();
        }
        return ResponseEntity.ok(statisticsService.getMonthlyRevenueMap(year,paymentModes,categories));
    }

    @GetMapping("/finance/room-types/revenue")
    ResponseEntity<Map<String, Double>> getRoomTypeRevenue(
    ){
        return ResponseEntity.ok(statisticsService.getRoomTypeRevenue());
    }
}
