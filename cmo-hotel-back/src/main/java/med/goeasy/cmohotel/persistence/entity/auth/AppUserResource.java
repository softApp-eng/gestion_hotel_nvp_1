package med.goeasy.cmohotel.persistence.entity.auth;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.Room;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class AppUserResource {

    @Id
    @GeneratedValue(generator="seq-resources")
    @SequenceGenerator(name="seq-resources",sequenceName="seq-resources", allocationSize=1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private AppUser user;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "app_user_rooms",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "room_id")
    )
    private Set<Room> rooms = new HashSet<>();


}
