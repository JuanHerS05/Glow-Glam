package uptc.edu.swi.glowglam.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptc.edu.swi.glowglam.model.Category;
import uptc.edu.swi.glowglam.repository.CategoryRepository;
import java.util.List;

@Service
public class CategoryServiceImpl implements ICategoryService {

    // CAMBIO: Remover static y marcar como final
    private final CategoryRepository categoryRepository;

    // CAMBIO: Inyección segura por constructor
    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // CAMBIO: Agregar @Override y remover static
    @Override
    @Transactional(readOnly = true)
    public List<Category> findAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }

    @Override
    @Transactional(readOnly = true)
    public Category findByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        return categoryRepository.findById(name.trim()).orElse(null);
    }

    @Override
    @Transactional
    public Category save(Category category) {
        if (category == null || category.getName() == null) {
            return null;
        }
        return categoryRepository.save(category);
    }
}