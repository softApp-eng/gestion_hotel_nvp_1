package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.auth.AppRole;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, String> {
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByUsernameAndAccountStatusTrue(String username);

    boolean existsByUsername(String username);
    boolean existsByUsernameAndIdIsNot(String username,String userid);

    List<AppUser> findAllByRolesContaining(AppRole role);

}
