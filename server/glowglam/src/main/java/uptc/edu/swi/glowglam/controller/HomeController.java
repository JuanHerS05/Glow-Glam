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
@RequestMapping("/api") // Quitamos la barra inclinada al final para estandarizar
public class HomeController {

    private final IProductService productService;
    private final ICategoryService categoryService;

    public HomeController(IProductService productService, ICategoryService categoryService) {
        this.productService = productService;
        this.categoryService = categoryService;
    }

    // GET: http://localhost:8080/api/home
    // CORRECCIÓN: Le damos una ruta explícita para evitar que el proxy de Vite devuelva el index.html
    @GetMapping("/home")
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

    // GET: http://localhost:8080/api/check-admin
    @GetMapping("/check-admin")
    public ResponseEntity<?> checkAdminStatus(HttpSession session) {
        Role usuario = (Role) session.getAttribute("usuarioLogueado");
        
        if (usuario == null || usuario.getRole() != RoleEnum.ADMIN) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Acceso no autorizado.");
        }
        
        // Si es admin, responde un 200 OK indicando que puede proceder
        return ResponseEntity.ok().build();
    }
}
