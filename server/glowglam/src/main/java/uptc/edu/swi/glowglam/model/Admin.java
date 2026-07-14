package uptc.edu.swi.glowglam.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import uptc.edu.swi.glowglam.model.Enums.RoleEnum;

@Entity
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "id")// <-- Vincula 'id_admin' con el 'id' heredado de Role
public class Admin extends Role {
    
    private String name;

    public Admin() {
        super();
    }

    public Admin(String name, String email, String password) {
        super(email, password, RoleEnum.ADMIN);
        this.name = name;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}