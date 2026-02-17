package med.goeasy.cmohotel.security.services;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.config.ConfigProperties;
import med.goeasy.cmohotel.exception.OperationNotPermittedException;
import med.goeasy.cmohotel.exception.TokenRefreshException;
import med.goeasy.cmohotel.persistence.entity.auth.AppPermission;
import med.goeasy.cmohotel.persistence.entity.auth.AppRole;
import med.goeasy.cmohotel.persistence.entity.auth.AppToken;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.persistence.repository.AppTokenRepository;
import med.goeasy.cmohotel.presentation.dto.user.UserResponse;
import med.goeasy.cmohotel.security.dto.Token;
import med.goeasy.cmohotel.security.jwt.JwtUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Transactional
@Service
public class TokenServiceImpl implements TokenServiceFace {

    private final JwtUtils jwtUtils;
    private final AppTokenRepository appTokenRepository;
    private final ConfigProperties ConfigProperties;
    private final ActivityLogService activityLogService;
    private final HttpServletRequest request;


    @Override
    public Token generateToken(AppUser user) {
        if (user == null)
            throw new OperationNotPermittedException("user is null");
        String tokenId = UUID.randomUUID().toString();
        Token token = jwtUtils.generateToken(
                tokenId,
                user.getUsername(),
                user.getRoles().stream().map(AppRole::getName).collect(Collectors.toList()),
                user.getPermissions().stream().map(AppPermission::getName).collect(Collectors.toList())
        );
        //persist token
        appTokenRepository.save(
                AppToken.builder()
                        .user(user)
                        .token(tokenId)
                        .revoked(false)
                        .build()
        );
        token.setUser(UserResponse.mapToUserResponse(user));
        log.info(String.format("token generated for -> %s",user.getId()));
        activityLogService.logActivity(
                EAuditActionTarget.AUTH,
                EAuditActionOperation.LOGIN,
                String.format("Connexion réussie : L'utilisateur '%s' s'est authentifié avec succès. token ID: %s.",
                        user.getUsername(), tokenId),
                activityLogService.getClientIp(request),
                user.getUsername()
        );
        return token;
    }

    @Override
    public Token generateTokenFromRefreshToken(String refresh) {
        if (!jwtUtils.validateJwtToken(refresh))
            throw new TokenRefreshException("refreshToken","invalid refresh token!");
        Claims claims = jwtUtils.getClaimsFromJwtToken(refresh);
        AppToken appToken = findByToken(claims.getId()).orElse(null);
        if (appToken == null || appToken.isRevoked())
            throw new TokenRefreshException("refreshToken","Refresh token is revoked!");
        deleteByToken(claims.getId());
        log.info("generate Refresh token ");
        return generateToken(
                appToken.getUser()
        );
    }

    @Override
    public void deleteInvaldeTokens() {
        LocalDateTime now = LocalDateTime.now();
        now = now.minusMinutes(ConfigProperties.jwtExpirationRefreshMn());
        appTokenRepository.deleteAllByRevokedIsTrueOrCreatedAtBefore(now);
        log.info("delete Invalid Tokens");
    }

    @Override
    public Optional<AppToken> findByToken(String token) {
        return appTokenRepository.findByToken(token);
    }

    @Override
    public void deleteByToken(String token) {
        appTokenRepository.deleteByToken(token);
        log.info("delete registered token");
    }

}
