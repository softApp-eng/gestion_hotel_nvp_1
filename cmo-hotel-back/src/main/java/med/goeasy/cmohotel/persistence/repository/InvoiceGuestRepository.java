package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.InvoiceGuest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceGuestRepository extends JpaRepository<InvoiceGuest, Long> {
}
