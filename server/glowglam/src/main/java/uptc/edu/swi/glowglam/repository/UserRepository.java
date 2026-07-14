package uptc.edu.swi.glowglam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uptc.edu.swi.glowglam.model.Role;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Role, Long> {
    
  
    Optional<Role> findByEmailAndUserpass(String email, String userpass);

    Optional<Role> findByEmail(String email);

}
