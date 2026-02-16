package med.goeasy.cmohotel.persistence.entity.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import med.goeasy.cmohotel.security.enums.ERoleSystem;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
@Entity
public class AppUser implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false,unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private Boolean accountStatus;

    private String firstName;
    private String lastName;
    private String avatar;
    private boolean isSystem;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "app_user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<AppRole> roles = new HashSet<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return getPermissions().stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getName()))
                .toList();
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(this.accountStatus);
    }

    @Override
    public String getPassword() {
        return password;
    }

    public Set<AppPermission> getPermissions() {
        if (roles == null)
            return Set.of();
        return roles.stream().map(AppRole::getPermissions)
                .flatMap(Collection::stream)
                .collect(Collectors.toSet());
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public void grant(AppRole role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        if (role != null) {
            this.roles.add(role);
        }
    }

    public void revoke(AppRole role) {
        if (this.roles != null && role != null) {
            this.roles.remove(role);
        }
    }

    public void revokeAll() {
        if (this.roles != null) {
            this.roles.clear();
        }
    }

    public boolean isAdmin() {
        if (this.roles == null) {
            return false;
        }
        return roles.stream()
                .anyMatch(role -> ERoleSystem.ADMIN.getRoleName().equalsIgnoreCase(role.getName()));
    }
    /**
     * Check if the user has AT LEAST ONE of the specified permissions.
     */
    public boolean hasAnyPermission(String... permissionNames) {
        Set<AppPermission> permissions = getPermissions();
        for (String name : permissionNames) {
            if (permissions.stream().anyMatch(p -> p.getName().equalsIgnoreCase(name))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if the user has ALL of the specified permissions.
     */
    public boolean hasAllPermissions(String... permissionNames) {
        Set<String> userPermissionNames = getPermissions().stream()
                .map(AppPermission::getName)
                .collect(Collectors.toSet());

        for (String name : permissionNames) {
            if (!userPermissionNames.contains(name)) {
                return false;
            }
        }
        return true;
    }
}
