package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationDetailsResponseDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationRequestDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationResponseDto;
import med.goeasy.cmohotel.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/reservations")
@RestController
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/create")
    ResponseEntity<ApiResponse> create(Authentication authentication,@Valid @RequestBody ReservationRequestDto dto){
        reservationService.create(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("reservation crée").build());
    }

    @GetMapping("/search")
    ResponseEntity<PageDto<ReservationDetailsResponseDto>> search(
            Authentication authentication,
            //@RequestParam(defaultValue = "") String key,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size
    ){
        return ResponseEntity.ok(reservationService.search(authentication, page, size));
    }

}
