package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.pavillon.PavillonRequestDto;
import med.goeasy.cmohotel.presentation.dto.pavillon.PavillonResponseDto;
import med.goeasy.cmohotel.service.PavillonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/pavillons")
@RestController
public class PavillonController {

    private final PavillonService pavillonService;

    @PostMapping("/create")
    ResponseEntity<ApiResponse> create(Authentication authentication,@Valid @RequestBody PavillonRequestDto dto){
        pavillonService.create(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("pavillon crée").build());
    }

    @PutMapping("/update")
    ResponseEntity<ApiResponse> update(
            Authentication authentication,
            @Valid @RequestBody PavillonRequestDto dto,
            @Valid @NotBlank(message = "pavillon id requis") @RequestParam() Long id
    ){
        pavillonService.update(authentication,dto,id);
        return ResponseEntity.ok(ApiResponse.builder().message("pavillon modifiée").build());
    }


    @GetMapping("/all")
    ResponseEntity<List<PavillonResponseDto>> all(
            Authentication authentication
    ){
        return ResponseEntity.ok(pavillonService.getPavillons(authentication));
    }

    @GetMapping("/one")
    ResponseEntity<PavillonResponseDto> one(
            Authentication authentication,
            @Valid @NotBlank(message = "id pavillon requis") @RequestParam() Long id
    ){
        return ResponseEntity.ok(pavillonService.findById(authentication, id));
    }

}
