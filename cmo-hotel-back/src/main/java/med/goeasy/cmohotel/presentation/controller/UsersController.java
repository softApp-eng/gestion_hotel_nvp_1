package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.user.*;
import med.goeasy.cmohotel.service.UsersService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/users")
@RestController
public class UsersController {

    private final UsersService usersService;

    @GetMapping("/list")
    ResponseEntity<List<UserResponse>> list(Authentication authentication){
        return ResponseEntity.ok(usersService.list(authentication));
    }

    @GetMapping("/one")
    ResponseEntity<UserResponse> one(Authentication authentication,@Valid @NotBlank(message = "Utilisateur id requis") @RequestParam() String userID){
        return ResponseEntity.ok(usersService.one(userID, authentication));
    }

    @PostMapping("/create")
    ResponseEntity<ApiResponse> create(@Valid @RequestBody RegisterRequestDto dto){
        usersService.register(dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Utilisateur crée").build());
    }

    @PutMapping("/update")
    ResponseEntity<ApiResponse> update(@Valid @RequestBody UpdateUserRequestDto dto, @Valid @NotBlank(message = "Utilisateur id requis") @RequestParam() String userID){
        usersService.update(dto,userID);
        return ResponseEntity.ok(ApiResponse.builder().message("Utilisateur modifié").build());
    }

    @PutMapping("/password")
    ResponseEntity<ApiResponse> updatePassword(@Valid @RequestBody UpdateUserPasswordDto dto, @Valid @NotBlank(message = "Utilisateur id requis") @RequestParam() String userID){
        usersService.updatePassword(dto,userID);
        return ResponseEntity.ok(ApiResponse.builder().message("mot de passe modifié").build());
    }

    @PutMapping("/roles/assign")
    ResponseEntity<ApiResponse> assignRoles(@Valid @RequestBody UserRoleAssign dto){
        usersService.assignRoles(dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Roles assignés").build());
    }
}
