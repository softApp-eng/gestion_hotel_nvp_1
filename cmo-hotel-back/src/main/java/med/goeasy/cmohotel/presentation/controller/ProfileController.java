package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.profile.ProfileUpdateDto;
import med.goeasy.cmohotel.presentation.dto.profile.UpdatePasswordDto;
import med.goeasy.cmohotel.presentation.dto.user.UserResponse;
import med.goeasy.cmohotel.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/profile")
@RestController
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    ResponseEntity<UserResponse> getShortUserInfo(
            Authentication authentication,
            @RequestParam(required = false) Boolean roles,
            @RequestParam(required = false) Boolean permissions
    ){
        return ResponseEntity.ok(profileService.getShortUserInfo(authentication,roles,permissions));
    }

    @PutMapping("/password/change")
    ResponseEntity<ApiResponse> updatePassword(
            Authentication authentication,
            @Valid @RequestBody UpdatePasswordDto dto
    ){
        profileService.changeMyPassword(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Mot de passe changé").build());
    }

    @PutMapping("/me")
    ResponseEntity<ApiResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateDto dto
    ){
        profileService.updateProfile(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Profile modifié").build());
    }

}
