package uptc.edu.swi.glowglam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uptc.edu.swi.glowglam.model.Category;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, String> {
    
    // Spring Data genera automáticamente: SELECT c FROM Category c ORDER BY c.name ASC
    List<Category> findAllByOrderByNameAsc();
}