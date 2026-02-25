package med.goeasy.cmohotel.persistence.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter


public enum EMealType {

    DINER,
    DEJEUNER,
    PETIT_DEJEUNER;

    @JsonCreator
    public static EMealType fromValue(String value) {
        return valueOf(value.toUpperCase());
    }
}


