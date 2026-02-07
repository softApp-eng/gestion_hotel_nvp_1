package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.room.RoomRequestDto;
import med.goeasy.cmohotel.presentation.dto.room.RoomResponseDto;
import med.goeasy.cmohotel.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/rooms")
@RestController
public class RoomController {

    private final RoomService roomService;

    @PostMapping("/create")
    ResponseEntity<ApiResponse> create(Authentication authentication,@Valid @RequestBody RoomRequestDto dto){
        roomService.create(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("chambre crée").build());
    }

    @PutMapping("/update")
    ResponseEntity<ApiResponse> update(
            Authentication authentication,
            @Valid @RequestBody RoomRequestDto dto,
            @Valid @NotBlank(message = "id chambre requis") @RequestParam() Long id
    ){
        roomService.update(authentication,dto,id);
        return ResponseEntity.ok(ApiResponse.builder().message("chambre modifiée").build());
    }


    @GetMapping("/all")
    ResponseEntity<List<RoomResponseDto>> getRooms(
            Authentication authentication,
            @RequestParam(name = "pavillonId",required = false) Long pavillonId
    ){
        return ResponseEntity.ok(roomService.getRooms(authentication,pavillonId));
    }

    @GetMapping("/one")
    ResponseEntity<RoomResponseDto> one(
            Authentication authentication,
            @Valid @NotBlank(message = "id chambre requis") @RequestParam() Long id
    ){
        return ResponseEntity.ok(roomService.findById(authentication, id));
    }

}
