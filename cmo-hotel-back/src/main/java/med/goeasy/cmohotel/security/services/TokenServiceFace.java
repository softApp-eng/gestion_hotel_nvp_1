package med.goeasy.cmohotel.security.services;

import med.goeasy.cmohotel.persistence.entity.auth.AppToken;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.security.dto.Token;

import java.util.Optional;

public interface TokenServiceFace
{
    Token generateToken(AppUser user);
    Token generateTokenFromRefreshToken(String refresh);
    void deleteInvaldeTokens();
    Optional<AppToken> findByToken(String token);
    void deleteByToken(String token);

}
