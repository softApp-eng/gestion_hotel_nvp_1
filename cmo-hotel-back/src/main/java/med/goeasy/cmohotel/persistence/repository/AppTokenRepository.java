package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.auth.AppToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AppTokenRepository extends JpaRepository<AppToken, String> {
    void deleteAllByRevokedIsTrueOrCreatedAtBefore(LocalDateTime time);
    Optional<AppToken> findByToken(String token);
    void deleteByToken(String token);

    @Modifying
    @Query("DELETE FROM AppToken t WHERE t.user.id = ?1")
    void deleteUserTokens(String userID);
}
