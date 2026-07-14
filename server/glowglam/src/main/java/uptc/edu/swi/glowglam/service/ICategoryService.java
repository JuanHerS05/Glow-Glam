package uptc.edu.swi.glowglam.service;

import uptc.edu.swi.glowglam.model.Category;
import java.util.List;

public interface ICategoryService {
    
    List<Category> findAllCategories();
    Category findByName(String name);
    Category save(Category category);
}