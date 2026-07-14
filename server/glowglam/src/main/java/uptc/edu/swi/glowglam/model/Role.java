package uptc.edu.swi.glowglam.model;

import jakarta.persistence.*;
import uptc.edu.swi.glowglam.model.Enums.RoleEnum;

@Entity
@Table(name = "roles")
@Inheritance(strategy = InheritanceType.JOINED)
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // El nuevo ID numérico incremental para todo el sistema de usuarios

    @Column(unique = true, nullable = false)
    private String email; // Sigue siendo único para evitar correos duplicados, pero ya no es la PK
    
    @Column(name = "userpass")
    private String userpass; // Renombrado para evitar conflictos con la palabra reservada "password"
    
    @Enumerated(EnumType.STRING)
    private RoleEnum role;

    public Role() {
    }

    public Role(String email, String userpass, RoleEnum role) {
        this.email = email;
        this.userpass = userpass;
        this.role = role;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUserpass() { return userpass; }
    public void setUserpass(String userpass) { this.userpass = userpass; }
    public RoleEnum getRole() { return role; }
    public void setRole(RoleEnum role) { this.role = role; }
}
