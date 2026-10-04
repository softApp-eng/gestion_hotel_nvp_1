package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.SwitchedRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SwitchedRoomRepository extends JpaRepository<SwitchedRoom, Long> {
}
