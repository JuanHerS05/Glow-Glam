package uptc.edu.swi.glowglam.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class Category {
    
    @Id
    private String name; 
    private String description;
    private boolean active; 

    public Category() {
    }

    public Category(String name, String description, boolean active) {
        this.name = name;
        this.description = description;
        this.active = active;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}