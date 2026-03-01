package med.goeasy.cmohotel.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.enums.ERelationshipType;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(indexes = {
        @Index(name = "idx_person_firstname", columnList = "firstName"),
        @Index(name = "idx_person_lastname", columnList = "lastName"),
        @Index(name = "identity", columnList = "identity"),
})
@Entity
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    private Grade grade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_person_id")
    private Person primaryPerson;

    @Enumerated(EnumType.STRING)
    private ERelationshipType relationshipType;

    private String identity;

    private String firstName;
    private String lastName;

    private String gender;
    private String email;
    private LocalDate birthDate;
    private String phoneNumber;
    private String nationality;
    private String language;
    private String matricule;
    private String unite;
    @Column(length = 500)
    private String observation;

    private boolean archived; // true : person archived or deleted, false : person active

    public String getFullName() {
        String gradeName = (grade != null) ? grade.getName() : "";

        // Retourne "GRADE Prénom NOM" (ex: CAPITAINE Anas Bouguerra)
        return String.format("%s %s %s",
                gradeName,
                this.firstName != null ? this.firstName : "",
                this.lastName != null ? this.lastName : ""
        ).trim().replaceAll("\\s{2,}", " ");
    }
}
