package med.goeasy.cmohotel.persistence.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum EInvoiceStatus {

    PAID("PAID","Payé"),
    UNPAID("UNPAID","Non payé"),
    IN_PROGRESS("IN_PROGRESS","En cours"),
    CANCELED("CANCELED","Annulé"),
    ;
    private final String code;
    private final String name;
}
