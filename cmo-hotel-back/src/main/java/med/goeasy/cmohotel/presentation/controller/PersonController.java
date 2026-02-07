package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.person.PersonRequestDto;
import med.goeasy.cmohotel.presentation.dto.person.PersonResponseDto;
import med.goeasy.cmohotel.service.PersonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/persons")
@RestController
public class PersonController {

    private final PersonService personService;

    @PostMapping("/create")
    ResponseEntity<ApiResponse> create(Authentication authentication,@Valid @RequestBody PersonRequestDto dto){
        personService.create(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("personne crée").build());
    }

    @PutMapping("/update")
    ResponseEntity<ApiResponse> update(
            Authentication authentication,
            @Valid @RequestBody PersonRequestDto dto,
            @Valid @NotBlank(message = "person id requis") @RequestParam() String personId
    ){
        personService.update(authentication,dto,personId);
        return ResponseEntity.ok(ApiResponse.builder().message("personne modifiée").build());
    }


    @GetMapping("/search")
    ResponseEntity<PageDto<PersonResponseDto>> search(
            Authentication authentication,
            @RequestParam(defaultValue = "") String key,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size
    ){
        return ResponseEntity.ok(personService.search(authentication,key, page, size));
    }

    @GetMapping("/one")
    ResponseEntity<PersonResponseDto> one(
            Authentication authentication,
            @Valid @NotBlank(message = "id personne requis") @RequestParam() String personId
    ){
        return ResponseEntity.ok(personService.findById(authentication, personId));
    }

    @DeleteMapping("/delete")
    ResponseEntity<ApiResponse> delete(
            Authentication authentication,
            @Valid @NotBlank(message = "id personne requis") @RequestParam() String personId
    ){
        personService.delete(authentication, personId);
        return ResponseEntity.ok(ApiResponse.builder().message("personne supprimée").build());
    }





}
