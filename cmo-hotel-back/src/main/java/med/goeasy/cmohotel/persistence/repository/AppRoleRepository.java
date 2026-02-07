package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.auth.AppRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AppRoleRepository extends JpaRepository<AppRole, String> {
    Optional<AppRole> findByName(String name);
    @Query("select r from AppRole r order by r.isSystem desc , r.title")
    List<AppRole> getAllRoles();

    boolean existsByTitle(String s);
    boolean existsByTitleAndIdNot(String title,String id);

    boolean existsByNameOrTitle(String name, String title);
}
