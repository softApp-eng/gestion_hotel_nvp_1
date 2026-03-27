package med.goeasy.cmohotel.presentation.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.statistic.RoomTypeOccupation;
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

    /// /////////////////////////////////////////////////////////////////////////////
    ///                          INVOICES STATISTICS                              ///
    /// /////////////////////////////////////////////////////////////////////////////

    @GetMapping("/finance/counts")
    ResponseEntity<Map<String, Long>> getFinancialStatistics(
            Authentication authentication
    ){
        return ResponseEntity.ok(statisticsService.getFinancialStatistics(authentication));
    }

    @GetMapping("/finance/monthly/revenue")
    ResponseEntity<Map<Integer, Double>> getMonthlyRevenueMap(
            Authentication authentication,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) List<String> paymentModes,
            @RequestParam(required = false) List<String> categories
    ){
        if (year == null){
            year = LocalDate.now().getYear();
        }
        return ResponseEntity.ok(statisticsService.getMonthlyRevenueMap(authentication, year,paymentModes,categories));
    }

    @GetMapping("/finance/room-types/revenue")
    ResponseEntity<Map<String, Double>> getRoomTypeRevenue(
            Authentication authentication
    ){
        return ResponseEntity.ok(statisticsService.getRoomTypeRevenue(authentication));
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                        RESERVATIONS STATISTICS                            ///
    /// /////////////////////////////////////////////////////////////////////////////

    @GetMapping("/reservation/monthly/counts")
    ResponseEntity<Map<Integer, Long>> getMonthlyReservations(
            Authentication authentication,
            @RequestParam(required = false) Integer year
    ){
        if (year == null){
            year = LocalDate.now().getYear();
        }
        return ResponseEntity.ok(statisticsService.getMonthlyReservations(authentication, year));
    }

    @GetMapping("/reservation/category/monthly/counts")
    ResponseEntity<Map<String, Map<Integer, Long>>> getMonthlyReservationsByCategories(
            Authentication authentication,
            @RequestParam(required = false) Integer year
    ){
        if (year == null){
            year = LocalDate.now().getYear();
        }
        return ResponseEntity.ok(statisticsService.getMonthlyReservationsByCategories(authentication, year));
    }

    @GetMapping("/reservations/counts")
    ResponseEntity<Map<String, Long>> getReservationsStatistics(
            Authentication authentication
    ){
        return ResponseEntity.ok(statisticsService.getReservationsStatistics(authentication));
    }

    @GetMapping("/reservations/current/counts")
    ResponseEntity<Map<String, Long>> getReservationsCurrentState(
            Authentication authentication
    ){
        return ResponseEntity.ok(statisticsService.getReservationsCurrentState(authentication));
    }

    @GetMapping("/reservations/rooms/occupation")
    ResponseEntity<List<RoomTypeOccupation>> getRoomTypeOccupationStatistics(
            Authentication authentication
    ){
        return ResponseEntity.ok(statisticsService.getRoomTypeOccupationStatistics(authentication));
    }

}
