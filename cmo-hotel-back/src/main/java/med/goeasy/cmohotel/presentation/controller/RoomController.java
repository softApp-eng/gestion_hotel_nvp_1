package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.room.*;
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
            @Valid @NotNull(message = "id chambre requis") @RequestParam() Long id
    ){
        roomService.update(authentication,dto,id);
        return ResponseEntity.ok(ApiResponse.builder().message("chambre modifiée").build());
    }


    @GetMapping("/all")
    ResponseEntity<List<RoomResponseDto>> getRooms(
            Authentication authentication,
            @RequestParam(name = "pavillonId",required = false) Long pavillonId,
            @RequestParam(name = "clean",required = false) Boolean clean
    ){
        return ResponseEntity.ok(roomService.getRooms(authentication,pavillonId,clean));
    }


    @GetMapping("/granted")
    ResponseEntity<List<RoomResponseDto>> getRantedRooms(
            Authentication authentication
    ){
        return ResponseEntity.ok(roomService.getGrantedRooms(authentication));
    }

    @GetMapping("/one")
    ResponseEntity<RoomResponseDto> one(
            Authentication authentication,
            @Valid @NotNull(message = "id chambre requis") @RequestParam() Long id
    ){
        return ResponseEntity.ok(roomService.findById(authentication, id));
    }

    @DeleteMapping("/delete")
    ResponseEntity<ApiResponse> deleteRoom(
            Authentication authentication,
            @Valid @NotNull(message = "id chambre requis") @RequestParam() Long id
    ){
        roomService.deleteRoom(authentication,id);
        return ResponseEntity.ok(ApiResponse.builder().message("Chambre supprimée").build());
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                                  ROOM TYPES                               ///
    /// /////////////////////////////////////////////////////////////////////////////

    @PostMapping("/types/create")
    ResponseEntity<ApiResponse> createType(Authentication authentication,@Valid @RequestBody RoomTypeRequestDto dto){
        roomService.createRoomType(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("type crée").build());
    }

    @PutMapping("/types/update")
    ResponseEntity<ApiResponse> updateType(
            Authentication authentication,
            @Valid @RequestBody RoomTypeRequestDto dto,
            @Valid @NotNull(message = "id type requis") @RequestParam() Long id
    ){
        roomService.updateRoomType(authentication,dto,id);
        return ResponseEntity.ok(ApiResponse.builder().message("type modifiée").build());
    }

    @DeleteMapping("/types/delete")
    ResponseEntity<ApiResponse> deleteRoomType(
            Authentication authentication,
            @Valid @NotNull(message = "id type requis") @RequestParam() Long id
    ){
        roomService.deleteRoomType(authentication,id);
        return ResponseEntity.ok(ApiResponse.builder().message("type supprimé").build());
    }


    @GetMapping("/types/all")
    ResponseEntity<List<RoomTypeDto>> getRoomTypes(
            Authentication authentication
    ){
        return ResponseEntity.ok(roomService.getRoomTypes(authentication));
    }

    @GetMapping("/types/one")
    ResponseEntity<RoomTypeDto> getRoomType(
            Authentication authentication,
            @Valid @NotNull(message = "id type requis") @RequestParam() Long id
    ){
        return ResponseEntity.ok(roomService.getRoomType(authentication, id));
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                                  ROOM PRICES                               ///
    /// /////////////////////////////////////////////////////////////////////////////

    @PostMapping("/prices/create")
    ResponseEntity<ApiResponse> createRoomPrice(Authentication authentication,@Valid @RequestBody RoomPriceRequestDto dto){
        roomService.createRoomPrice(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("prix crée").build());
    }

    @PutMapping("/prices/update")
    ResponseEntity<ApiResponse> updateRoomPrice(
            Authentication authentication,
            @Valid @RequestBody RoomPriceRequestDto dto,
            @Valid @NotNull(message = "id prix requis") @RequestParam() Long id
    ){
        roomService.updateRoomPrice(authentication,dto,id);
        return ResponseEntity.ok(ApiResponse.builder().message("prix modifiée").build());
    }

    @DeleteMapping("/prices/delete")
    ResponseEntity<ApiResponse> deleteRoomPrice(
            Authentication authentication,
            @Valid @NotNull(message = "id prix requis") @RequestParam() Long id
    ){
        roomService.deleteRoomPrice(authentication,id);
        return ResponseEntity.ok(ApiResponse.builder().message("prix supprimé").build());
    }


    @GetMapping("/prices/all")
    ResponseEntity<List<RoomPriceResponseDto>> getRoomPrice(
            Authentication authentication
    ){
        return ResponseEntity.ok(roomService.getRoomPrices(authentication));
    }

    @GetMapping("/prices/byType")
    ResponseEntity<List<RoomPriceResponseDto>> getRoomPricesByType(
            Authentication authentication,
            @Valid @NotNull(message = "id type requis") @RequestParam() Long id
    ){
        return ResponseEntity.ok(roomService.getRoomPricesByType(authentication,id));
    }

    @GetMapping("/prices/one")
    ResponseEntity<RoomPriceResponseDto> getRoomPrice(
            Authentication authentication,
            @Valid @NotNull(message = "id prix requis") @RequestParam() Long id
    ){
        return ResponseEntity.ok(roomService.getRoomPrice(authentication, id));
    }

}
