package uptc.edu.swi.glowglam.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import uptc.edu.swi.glowglam.model.Client;
import uptc.edu.swi.glowglam.service.IWishlistService;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final IWishlistService wishlistService;

    public WishlistController(IWishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleWishlist(@RequestBody Map<String, String> payload, HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        Object user = session.getAttribute("usuarioLogueado");
        
        if (!(user instanceof Client)) {
            response.put("message", "No has iniciado sesión.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String barcode = payload.get("barcode");
        Client cliente = (Client) user;
        boolean added = wishlistService.toggleWishlist(cliente, barcode);
        
        response.put("status", added ? "added" : "removed");
        response.put("message", added ? "Producto añadido a favoritos" : "Producto eliminado de favoritos");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Object> viewWishlist(HttpSession session) {
        Object user = session.getAttribute("usuarioLogueado");
        
        if (!(user instanceof Client)) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Acceso denegado. Inicia sesión.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        Client cliente = (Client) user;
        // Retorna directamente los datos que React necesita procesar
        return ResponseEntity.ok(wishlistService.getWishlistByClient(cliente.getId()));
    }
}