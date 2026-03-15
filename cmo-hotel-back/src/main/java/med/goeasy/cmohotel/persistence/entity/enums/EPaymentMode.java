package med.goeasy.cmohotel.persistence.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum EPaymentMode {

    PRISE_EN_CHARGE("Prise en charge"),
    TPE("TPE"),
    ESPECE("Espèce"),
    CHEQUE("Cheque"),
    ;

    private final String name;

}
