package uptc.edu.swi.glowglam.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpSession;
import uptc.edu.swi.glowglam.model.Role;
import uptc.edu.swi.glowglam.model.Enums.RoleEnum;
import uptc.edu.swi.glowglam.service.ICategoryService;
import uptc.edu.swi.glowglam.service.IProductService;

@RestController
@RequestMapping("/api/") // Todas las rutas empezarán con /api
public class HomeController {

    private final IProductService productService;
    private final ICategoryService categoryService;

    public HomeController(IProductService productService, ICategoryService categoryService) {
        this.productService = productService;
        this.categoryService = categoryService;
    }

    // GET: http://localhost:8080/api/home
    // Devuelve todos los datos necesarios para pintar la página principal
    @GetMapping
    public ResponseEntity<Map<String, Object>> getHomeData(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        // Verificamos si hay un usuario logueado en la sesión
        Role usuario = (Role) session.getAttribute("usuarioLogueado");
        if (usuario != null) {
            response.put("usuario", usuario);
        } else {
            response.put("usuario", null);
        }

        // Agregamos los productos activos y las categorías
        response.put("activeProducts", productService.findActiveProducts());
        response.put("allCategories", categoryService.findAllCategories());

        return ResponseEntity.ok(response);
    }

    // GET: http://localhost:8080/api/home/check-admin
    // Un endpoint rápido para que el Front verifique si el usuario actual es ADMIN antes de dejarlo entrar a las vistas de administración
    @GetMapping("/checkAdmin")
    public ResponseEntity<?> checkAdminStatus(HttpSession session) {
        Role usuario = (Role) session.getAttribute("usuarioLogueado");
    
        if (usuario == null || usuario.getRole() != RoleEnum.ADMIN) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Acceso no autorizado.");
        }
        
        // Si es admin, responde un 200 OK indicando que puede proceder
        return ResponseEntity.ok().build();
    } 
}
