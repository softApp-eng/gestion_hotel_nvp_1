package med.goeasy.cmohotel.persistence.entity.auth;

import jakarta.persistence.*;
import lombok.*;
import med.goeasy.cmohotel.persistence.entity.enums.EPermissionsGroup;
import med.goeasy.cmohotel.persistence.entity.enums.EPermissionsModule;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class AppPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false,unique = true)
    private String name; // permission

    @Column(nullable = false, unique = true)
    private String title; // titre de la permission

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EPermissionsModule module; // module

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EPermissionsGroup groupe; // view / manage / delete

    private String description;

    private boolean affectable;

}
