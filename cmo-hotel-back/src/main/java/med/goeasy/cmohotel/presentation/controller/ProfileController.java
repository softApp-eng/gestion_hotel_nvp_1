package med.goeasy.cmohotel.presentation.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.user.UserResponse;
import med.goeasy.cmohotel.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

}
