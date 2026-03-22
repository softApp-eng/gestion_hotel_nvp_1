package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.reservation.*;
import med.goeasy.cmohotel.service.ReservationService;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

    @PutMapping("/update")
    ResponseEntity<ApiResponse> update(
            Authentication authentication,
            @Valid @RequestBody ReservationRequestDto dto,
            @Valid @NotNull(message = "code de reservation requis") @RequestParam() Long code
    ){
        reservationService.update(authentication,dto,code);
        return ResponseEntity.ok(ApiResponse.builder().message("reservation modifiée").build());
    }

    @PutMapping("/accept")
    ResponseEntity<ApiResponse> acceptReservation(
            Authentication authentication,
            @Valid @NotNull(message = "code de reservation requis") @RequestParam() Long code,
            @RequestParam() @Valid @NotNull(message = "Date checkin requise") @DateTimeFormat(pattern = "dd/MM/yyyy HH:mm") LocalDateTime checkin
    ){
        reservationService.acceptReservation(authentication,code,checkin);
        return ResponseEntity.ok(ApiResponse.builder().message("reservation acceptée").build());
    }

    @PutMapping("/close")
    ResponseEntity<ApiResponse> closeReservation(
            Authentication authentication,
            @Valid @NotNull(message = "code de reservation requis") @RequestParam() Long code,
            @RequestParam() @Valid @NotNull(message = "Date checkin requise") @DateTimeFormat(pattern = "dd/MM/yyyy HH:mm") LocalDateTime checkout
    ){
        reservationService.closeReservation(authentication,code,checkout);
        return ResponseEntity.ok(ApiResponse.builder().message("reservation cloturée").build());
    }

    @PutMapping("/cancel")
    ResponseEntity<ApiResponse> cancelReservation(
            Authentication authentication,
            @Valid @NotNull(message = "code de reservation requis") @RequestParam() Long code
    ){
        reservationService.cancelReservation(authentication,code);
        return ResponseEntity.ok(ApiResponse.builder().message("reservation annulée").build());
    }

    @PostMapping("/time/extend")
    ResponseEntity<ApiResponse> prolonger(
            Authentication authentication,
            @Valid @NotNull(message = "code de reservation requis") @RequestParam() Long code,
            @RequestParam() @Valid @NotNull(message = "Date checkin requise") @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate date
    ){
        reservationService.prolonger(authentication,code,date);
        return ResponseEntity.ok(ApiResponse.builder().message("reservation bien modifiée").build());
    }

    @PostMapping("/switch-room")
    ResponseEntity<ApiResponse> switchRoom(
            Authentication authentication,
            @Valid @RequestBody SwitchRoomDto dto
    ){
        reservationService.switchRoom(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("reservation bien modifiée").build());
    }

    @DeleteMapping("/switch-room")
    ResponseEntity<ApiResponse> removeLastRoomSwitch(
            Authentication authentication,
            @Valid @NotBlank(message = "id de reservation requis") @RequestParam() String reservationId,
            @Valid @NotBlank(message = "id de changement requis") @RequestParam() Long switchedRoomId
    ){
        reservationService.removeLastRoomSwitch(authentication,reservationId,switchedRoomId);
        return ResponseEntity.ok(ApiResponse.builder().message("reservation bien modifiée").build());
    }

    @DeleteMapping("/delete")
    ResponseEntity<ApiResponse> deleteReservation(
            Authentication authentication,
            @Valid @NotNull(message = "code de reservation requis") @RequestParam() Long code
    ){
        reservationService.deleteReservation(authentication,code);
        return ResponseEntity.ok(ApiResponse.builder().message("reservation supprimée").build());
    }

    @GetMapping("/one")
    ResponseEntity<ReservationDetailsResponseDto> one(
            Authentication authentication,
            @Valid @NotNull(message = "code de reservation requis") @RequestParam() Long code
    ){
        return ResponseEntity.ok(reservationService.getReservationByCode(authentication, code));
    }

    @GetMapping("/upcoming")
    ResponseEntity<List<ReservedRoomResponseDto>> getUpcomingReservations(
            Authentication authentication
    ){
        return ResponseEntity.ok(reservationService.getUpcomingReservations(authentication));
    }

    @GetMapping("/residents")
    ResponseEntity<List<ReservationResponseDto>> getResidentReservations(
            Authentication authentication
    ){
        return ResponseEntity.ok(reservationService.getResidentReservations(authentication));
    }

    @GetMapping("/search")
    ResponseEntity<PageDto<ReservationDetailsResponseDto>> search(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "") String key,
            @RequestParam(required = false, defaultValue = "") Long reservationCode,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate end,
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


    @GetMapping("/sejours")
    ResponseEntity<List<ReservationDetailsResponseDto>> getSejours(Authentication authentication){
        return ResponseEntity.ok(reservationService.getSejours());
    }

    @GetMapping("/planning/{type}")
    ResponseEntity<List<ReservationCalenderResponseDto>> getRangReservations(
            Authentication authentication,
            @PathVariable String type,
            @RequestParam() @Valid @NotNull(message = "Date debut requis") @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate start,
            @RequestParam() @Valid @NotNull(message = "Date fin requis") @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate end
    ){
        List<ReservationCalenderResponseDto> reservations= new ArrayList<>();
        if ("reservations".equals(type)) {
            reservations = reservationService.getReservationForCalender(authentication, start, end);
        } else if ("rooms".equals(type)) {
            reservations = reservationService.getReservationForCalender(authentication, start, end);
        }


        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/invoice")
    public ResponseEntity<byte[]> downloadInvoice( Authentication authentication,@Valid @NotNull(message = "code de reservation requis") @RequestParam() Long code) throws Exception {
        byte[] pdf = reservationService.generateInvoice(authentication,code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Reservation_" + code + ".pdf");

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

}
