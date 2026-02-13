package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.enums.ERelationshipType;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationDetailsResponseDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationRequestDto;
import med.goeasy.cmohotel.service.ReservationService;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
            @RequestParam(required = false, defaultValue = "") String key,
            @RequestParam(required = false, defaultValue = "") Long reservationCode,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size
    ){
        List<EReservationCategory> ecategories = new ArrayList<>();
        if (categories != null && !categories.isEmpty()) {
            categories.forEach((category) -> {
                if (!EnumUtils.isValidEnum(EReservationCategory.class, category))
                    throw new BadRequestException("Categorie de reservation invalide : " + category);
                ecategories.add(EReservationCategory.valueOf(category));
            });
        }

        List<EReservationStatus> estatus = new ArrayList<>();
        if (status != null && !status.isEmpty()) {
            status.forEach((s) -> {
                if (!EnumUtils.isValidEnum(EReservationStatus.class, s))
                    throw new BadRequestException("statut de reservation invalide : " + s);
                estatus.add(EReservationStatus.valueOf(s));
            });
        }


        return ResponseEntity.ok(reservationService.search(
                authentication,
                key,
                reservationCode,
                ecategories,
                estatus,
                start, end,
                page, size
        ));
    }

}
