package med.goeasy.cmohotel.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.config.ConfigProperties;
import med.goeasy.cmohotel.security.dto.Token;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtUtils {

  private final ConfigProperties configProperties;


  public Token generateToken(String id, String username, List<String> roles, List<String> permissions){
    Instant instant = Instant.now();
    return Token.builder()
            .accessToken(
                    Jwts.builder()
                            .id(id)
                            .subject(username)
                            .issuedAt((Date.from(instant)))
                            .issuer("dashboard-trans-service")
                            .claim("roles",roles)
                            .claim("permissions",permissions)
                            .expiration(Date.from(instant.plus(configProperties.jwtExpirationAccessMn(), ChronoUnit.MINUTES)))
                            .signWith(getSignInKey())
                            .compact()
            )
            .refreshToken(
                    Jwts.builder()
                            .id(id)
                            .issuedAt((Date.from(instant)))
                            .issuer("dashboard-trans-service")
                            .expiration(Date.from(instant.plus(configProperties.jwtExpirationRefreshMn(), ChronoUnit.MINUTES)))
                            .signWith(getSignInKey())
                            .compact()
            )
            .build();

  }

  public Jws<Claims> parseClaimsFromJwtToken(String token) {
    return Jwts.parser()
            .verifyWith(getSignInKey())
            .build()
            .parseSignedClaims(token);
  }

  public Claims getClaimsFromJwtToken(String token) {
    return parseClaimsFromJwtToken(token)
            .getPayload();
  }

  private SecretKey getSignInKey() {
    return Keys.hmacShaKeyFor(configProperties.jwtSecret().getBytes(StandardCharsets.UTF_8));
  }

  public String getIdFromJwtToken(String token) {
    return getClaimsFromJwtToken(token).getId();
  }
  public String getUsernameFromJwtToken(String token) {
    return getClaimsFromJwtToken(token).getSubject();
  }

  public String parseJwt(HttpServletRequest request) {
    String headerAuth = request.getHeader("Authorization");
    if (StringUtils.hasText(headerAuth) && headerAuth.startsWith(configProperties.jwtBearer())) {
      return headerAuth.substring(configProperties.jwtBearer().length());
    }
    return null;
  }

  public boolean validateJwtToken(String authToken) {
    try {
      parseClaimsFromJwtToken(authToken);
      return true;
    } catch (SignatureException e) {
      log.error("Invalid JWT signature: {}", e.getMessage());
    } catch (MalformedJwtException e) {
      log.error("Invalid JWT token: {}", e.getMessage());
    } catch (ExpiredJwtException e) {
      log.error("JWT token is expired: {}", e.getMessage());
    } catch (UnsupportedJwtException e) {
      log.error("JWT token is unsupported: {}", e.getMessage());
    } catch (IllegalArgumentException e) {
      log.error("JWT claims string is empty: {}", e.getMessage());
    }
    return false;
  }

}
