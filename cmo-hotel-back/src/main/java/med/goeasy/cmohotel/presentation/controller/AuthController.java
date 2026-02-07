package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.security.dto.LoginWithCredentials;
import med.goeasy.cmohotel.security.dto.Token;
import med.goeasy.cmohotel.security.dto.TokenRefreshRequest;
import med.goeasy.cmohotel.security.services.TokenServiceFace;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/auth")
@RestController
public class AuthController {

  private final TokenServiceFace tokenService;
  private final AuthenticationManager authenticationManager;

  @PostMapping("/login")
  public ResponseEntity<Token> authenticateUser(@Valid @RequestBody LoginWithCredentials loginRequest) {

    Authentication authentication = authenticationManager
            .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password()));
    SecurityContextHolder.getContext().setAuthentication(authentication);
    AppUser user = (AppUser) authentication.getPrincipal();
    Token token = tokenService.generateToken(user);
    return ResponseEntity.ok(token);
  }

  @PostMapping("/refreshtoken")
  public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest tokenRefreshRequest) {
    return ResponseEntity.ok(tokenService.generateTokenFromRefreshToken(tokenRefreshRequest.getRefreshToken()));
  }

}
