package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.request.HousekeepingAgentRequestDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.request.PermanenceRequestDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.request.UpdateRoomCleanRequest;
import med.goeasy.cmohotel.presentation.dto.housekeeping.response.HousekeepingAgentResponseDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.response.PermanenceDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.response.RoomHousekeepingDto;
import med.goeasy.cmohotel.service.HouseKeepingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/house-keeping")
@RestController
public class HousekeepingController {

    private final HouseKeepingService houseKeepingService;


    /// /////////////////////////////////////////////////////////////////////////////
    ///                          HOUSE KEEPING FUNCTIONS                          ///
    /// /////////////////////////////////////////////////////////////////////////////

    @GetMapping("/history/search")
    ResponseEntity<PageDto<RoomHousekeepingDto>> searchHouseKeepingHistory(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "") String key,
            @RequestParam(required = false) List<Long> RoomTypes,
            @RequestParam(required = false) List<Long> rooms,
            @RequestParam(required = false) List<Long> agents,
            @RequestParam(required = false) Boolean anomalie,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate end,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size
    ){

        return ResponseEntity.ok(houseKeepingService.searchHouseKeepingHistory(
                authentication,
                key,
                RoomTypes != null ? RoomTypes : new ArrayList<>(),
                rooms != null ? rooms : new ArrayList<>(),
                agents != null ? agents : new ArrayList<>(),
                anomalie != null ? anomalie: false,
                start, end,
                page, size
        ));
    }


    @PutMapping("/housekeeping/room/availability")
    ResponseEntity<ApiResponse> toggleRoomAvailability(
            Authentication authentication,
            @Valid @NotNull(message = "agent id requis") @RequestParam() Long id
    ){
        houseKeepingService.toggleRoomAvailability(authentication, id);
        return ResponseEntity.ok(ApiResponse.builder().message("Etat de chambre modifié").build());
    }

    @PutMapping("/housekeeping/room/clean")
    ResponseEntity<ApiResponse> updateClean(
            Authentication authentication,
            @Valid @RequestBody() UpdateRoomCleanRequest dto
    ){
        houseKeepingService.updateClean(authentication, dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Etat de chambre modifié").build());
    }

    @PutMapping("/housekeeping/history/update")
    ResponseEntity<ApiResponse> updateHistory(
            Authentication authentication,
            @Valid @NotNull(message = "id requis") @RequestParam() Long id,
            @Valid @RequestBody() UpdateRoomCleanRequest dto
    ){
        houseKeepingService.updateHistory(authentication, dto,id);
        return ResponseEntity.ok(ApiResponse.builder().message("modifié").build());
    }

    @DeleteMapping("/housekeeping/history/delete")
    ResponseEntity<ApiResponse> deleteHistory(
            Authentication authentication,
            @Valid @NotNull(message = "id requis") @RequestParam() Long id
    ){
        houseKeepingService.deleteHistory(authentication,id);
        return ResponseEntity.ok(ApiResponse.builder().message("supprimé").build());
    }


    /// /////////////////////////////////////////////////////////////////////////////
    ///                            PERMANENCE FUNCTIONS                           ///
    /// /////////////////////////////////////////////////////////////////////////////

    @GetMapping("/permanence/list")
    ResponseEntity<List<PermanenceDto>> listPermanence(
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate end
    ){
        return ResponseEntity.ok(houseKeepingService.listPermanences(start, end));
    }

    @PostMapping("/permanence/create")
    ResponseEntity<PermanenceDto> createPermanence(
            Authentication authentication,
            @Valid @RequestBody() PermanenceRequestDto dto
    ){
        return ResponseEntity.ok(houseKeepingService.createPermanence(authentication, dto));
    }

    @PutMapping("/permanence/update")
    ResponseEntity<PermanenceDto> updatePermanence(
            Authentication authentication,
            @Valid @NotNull(message = "id requis") @RequestParam() Long id,
            @Valid @RequestBody() PermanenceRequestDto dto
    ){
        return ResponseEntity.ok(houseKeepingService.updatePermanence(authentication, dto, id));
    }

    @DeleteMapping("/permanence/delete")
    ResponseEntity<ApiResponse> deletePermanence(
            Authentication authentication,
            @Valid @NotNull(message = "id requis") @RequestParam() Long id
    ){
        houseKeepingService.deletePermanence(authentication, id);
        return ResponseEntity.ok(ApiResponse.builder().message("permanence supprimée").build());
    }


    /// /////////////////////////////////////////////////////////////////////////////
    ///                              AGENTS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    @GetMapping("/agents/all")
    ResponseEntity<List<HousekeepingAgentResponseDto>> listAllAgent(){
        return ResponseEntity.ok(houseKeepingService.getActiveAgents());
    }

    @PostMapping("/agents/create")
    ResponseEntity<HousekeepingAgentResponseDto> createAgent(Authentication authentication,@Valid @RequestBody HousekeepingAgentRequestDto dto){
        return ResponseEntity.ok(houseKeepingService.createAgent(authentication,dto));
    }

    @PutMapping("/agents/update")
    ResponseEntity<HousekeepingAgentResponseDto> updateAgent(
            Authentication authentication,
            @Valid @RequestBody HousekeepingAgentRequestDto dto,
            @Valid @NotNull(message = "agent id requis") @RequestParam() Long id
    ){
        return ResponseEntity.ok(houseKeepingService.updateAgent(authentication,id,dto));
    }

    @DeleteMapping("/agents/delete")
    ResponseEntity<ApiResponse> deleteAgent(Authentication authentication,@Valid @NotNull(message = "agent id requis") @RequestParam() Long id){
        houseKeepingService.deleteAgent(authentication,id);
        return ResponseEntity.ok(ApiResponse.builder().message("Agent supprimé").build());
    }


}
