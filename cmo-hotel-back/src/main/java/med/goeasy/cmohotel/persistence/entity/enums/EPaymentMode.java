package med.goeasy.cmohotel.persistence.entity.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EPaymentMode {

    PRISE_EN_CHARGE("PRISE_EN_CHARGE","Prise en charge"),
    TPE("TPE","TPE"),
    ESPECE("ESPECE","Espèce"),
    CHEQUE("CHEQUE","Cheque"),
    ;

    private final String code;
    private final String name;

}
