package uptc.edu.swi.glowglam.controller;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uptc.edu.swi.glowglam.model.Client;
import uptc.edu.swi.glowglam.model.Product;
import uptc.edu.swi.glowglam.model.Rating;
import uptc.edu.swi.glowglam.service.IProductService;
import uptc.edu.swi.glowglam.service.IRatingService;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final IRatingService ratingService;
    private final IProductService productService;

    public RatingController(IRatingService ratingService, IProductService productService) {
        this.ratingService = ratingService;
        this.productService = productService;
    }

@PostMapping("/rate")
public ResponseEntity<Map<String, Object>> rateProduct(@RequestBody Map<String, Object> payload) {
    Map<String, Object> response = new HashMap<>();

    // 1. Extraer parámetros enviados desde React mediante JSON
    String barcode = (String) payload.get("productBarcode");
    int score = (int) payload.get("score");
    String comment = (String) payload.get("comment");
    
    // Extraemos el objeto o mapa del cliente enviado desde el frontend
    Map<String, Object> clientMap = (Map<String, Object>) payload.get("client");

    // Validar Sesión / Presencia de usuario
    if (clientMap == null || clientMap.get("id") == null) {
        response.put("message", "Debes iniciar sesión para poder calificar.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // Reconstruimos el cliente de forma simple con su ID para asociarlo a la entidad Rating
    Client cliente = new Client();
    cliente.setId(((Number) clientMap.get("id")).longValue()); // Ajusta el tipo según uses Long o Integer en tu modelo

    Product producto = productService.findByBarcode(barcode);

    // 2. Validar Existencia del Producto
    if (producto == null) {
        response.put("message", "El producto especificado no existe.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // 3. Guardar Calificación
    try {
        Rating nuevaCalificacion = new Rating(producto, cliente, score, comment != null ? comment.trim() : "");
        ratingService.saveRating(nuevaCalificacion);
        
        Double nuevoPromedio = ratingService.getAverageRating(barcode);
        Long nuevoTotal = ratingService.getTotalRatings(barcode);

        response.put("message", "¡Calificación guardada exitosamente!");
        response.put("nuevoPromedio", nuevoPromedio);
        response.put("nuevoTotal", nuevoTotal);
        return ResponseEntity.ok(response);

    } catch (Exception e) {
        response.put("message", "Ya has calificado este producto anteriormente.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
}