package med.goeasy.cmohotel.persistence.entity.enums;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum ERoomStatus {
    //LIBRE("LIBRE","", ""),
    //RESERVEE("LIBRE","", ""),
    //OCCUPEE("LIBRE","", ""),
    //NoShow("LIBRE","", ""),


    //HORS_SERVICE("HORS_SERVICE","Hors service", "bloquer une chambre")
    ;

    private final String code;
    private final String name;
    private final String description;
}
