package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.auth.AppPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AppPermissionRepository extends JpaRepository<AppPermission, String> {
    boolean existsByName(String name);
    Optional<AppPermission> findByName(String name);

    @Query("select p from AppPermission p where p.affectable = true order by p.name")
    List<AppPermission> getAffectablePermissions();
}
