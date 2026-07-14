package uptc.edu.swi.glowglam.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import uptc.edu.swi.glowglam.model.Category;
import uptc.edu.swi.glowglam.model.Role;
import uptc.edu.swi.glowglam.model.Enums.RoleEnum;
import uptc.edu.swi.glowglam.service.ICategoryService;

@RestController
@RequestMapping("/api/categories") // Todas las rutas empezarán con /api/categories
public class CategoryController {

    private final ICategoryService categoryService;

    public CategoryController(ICategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // GET: http://localhost:8080/api/categories
    @GetMapping
    public ResponseEntity<List<Category>> findAllCategories() {
        return ResponseEntity.ok(categoryService.findAllCategories());
    }

    // POST: http://localhost:8080/api/categories
    @PostMapping
    public ResponseEntity<?> addCategory(@RequestBody Category categoryRequest, HttpSession session) {
        // Validación de sesión adaptada a API REST
        Role usuario = (Role) session.getAttribute("usuarioLogueado");
        if (usuario == null || usuario.getRole() != RoleEnum.ADMIN) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autorizado. Inicie sesión como ADMIN.");
        }

        // Validación de nombre duplicado
        if (categoryService.findByName(categoryRequest.getName()) != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Ya existe una categoría con ese nombre.");
        }

        Category category = new Category(
            categoryRequest.getName().trim(), 
            categoryRequest.getDescription(), 
            categoryRequest.isActive()
        );
        
        Category savedCategory = categoryService.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
    }

    // PUT: http://localhost:8080/api/categories
    @PutMapping
    public ResponseEntity<?> modifyCategory(@RequestBody Category categoryRequest, HttpSession session) {
        // Validación de sesión
        Role usuario = (Role) session.getAttribute("usuarioLogueado");
        if (usuario == null || usuario.getRole() != RoleEnum.ADMIN) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autorizado.");
        }

        Category existingCategory = categoryService.findByName(categoryRequest.getName());
        if (existingCategory == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La categoría que intentas modificar no existe.");
        }

        existingCategory.setDescription(categoryRequest.getDescription());
        existingCategory.setActive(categoryRequest.isActive());
        
        Category updatedCategory = categoryService.save(existingCategory);
        return ResponseEntity.ok(updatedCategory);
    }
}