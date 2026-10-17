package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.InvoicePrestation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoicePrestationRepository extends JpaRepository<InvoicePrestation, Long> {

    /**
     * Prestations facturées d'une facture (pour le recalcul des totaux après correction).
     */
    List<InvoicePrestation> findByInvoice_Num(String num);

}
