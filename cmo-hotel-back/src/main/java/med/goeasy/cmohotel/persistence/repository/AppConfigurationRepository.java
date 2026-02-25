package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.AppConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppConfigurationRepository extends JpaRepository<AppConfiguration, Long> {

}
