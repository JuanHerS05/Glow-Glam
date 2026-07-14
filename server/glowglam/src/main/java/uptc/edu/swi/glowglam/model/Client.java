package uptc.edu.swi.glowglam.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import uptc.edu.swi.glowglam.model.Enums.RoleEnum;

@Entity
@Table(name = "clients")
@PrimaryKeyJoinColumn(name = "id") // <-- Vincula 'id_client' con el 'id' heredado de Role
public class Client extends Role {
    
    private String name;

    public Client() {
        super();
    }

    public Client(String email, String password, String name) {
        super(email, password, RoleEnum.CUSTOMER);
        this.name = name;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}