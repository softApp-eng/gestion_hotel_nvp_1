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
    private String observation;

    private boolean archived; // true : person archived or deleted, false : person active


}
