package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.request.HousekeepingAgentRequestDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.response.HousekeepingAgentResponseDto;
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

    @GetMapping("/history/search") // TODO SEC
    ResponseEntity<PageDto<RoomHousekeepingDto>> searchHouseKeepingHistory(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "") String key,
            @RequestParam(required = false) List<Long> RoomTypes,
            @RequestParam(required = false) List<Long> rooms,
            @RequestParam(required = false) List<Long> agents,
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
                start, end,
                page, size
        ));
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
