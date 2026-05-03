package med.goeasy.cmohotel.persistence.entity.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EReservationStatus {

    PENDING("PENDING","En attente", "La demande est enregistrée mais pas encore validée."),
    CONFIRMED("CONFIRMED","Check-in", "La réservation est validée, la chambre est bloquée."),
    CANCELED("CANCELED","Annulée", "La réservation a été annulée avant l'arrivée du client."),
    CLOSED("CLOSED","Check-out", "Dossier archivé après facturation et règlement."),
    ;

    private final String code;
    private final String name;
    private final String description;
}
