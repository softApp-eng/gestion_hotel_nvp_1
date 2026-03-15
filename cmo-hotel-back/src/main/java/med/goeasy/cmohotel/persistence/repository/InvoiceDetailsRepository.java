package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.InvoiceDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceDetailsRepository extends JpaRepository<InvoiceDetails, Long> {
}
