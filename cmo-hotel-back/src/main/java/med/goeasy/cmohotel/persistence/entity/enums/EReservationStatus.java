package med.goeasy.cmohotel.persistence.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum EReservationStatus {

    CONFIRMED,
    PENDING,
    CLOSED,
    CANCELED,
    IN_PROGRESS
    ;

}
