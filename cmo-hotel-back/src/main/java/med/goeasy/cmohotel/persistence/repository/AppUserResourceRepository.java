package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Room;
import med.goeasy.cmohotel.persistence.entity.auth.AppUserResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Set;

public interface AppUserResourceRepository extends JpaRepository<AppUserResource, Long> {

    @Query("select o.rooms from AppUserResource o where o.user.id = ?1")
    Set<Room> findGrantedRooms(String userid);
}
