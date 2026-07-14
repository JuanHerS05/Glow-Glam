package uptc.edu.swi.glowglam.controller;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import uptc.edu.swi.glowglam.model.Image;
import uptc.edu.swi.glowglam.model.Product;
import uptc.edu.swi.glowglam.service.IProductService;
import uptc.edu.swi.glowglam.service.IRatingService;
import uptc.edu.swi.glowglam.service.IWishlistService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final IProductService productService;
    private final IRatingService ratingService;
    private final IWishlistService wishlistService;

    public ProductController(
            IProductService productService,
            IRatingService ratingService,
            IWishlistService wishlistService) {

        this.productService = productService;
        this.ratingService = ratingService;
        this.wishlistService = wishlistService;
    }

    // =========================
    // 📦 GET ALL PRODUCTS
    // =========================
    // =========================
    // 📦 GET ALL PRODUCTS (Corregido para React)
    // =========================
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAll(HttpSession session) {
        List<Product> products = productService.findAll();
        List<Map<String, Object>> response = new ArrayList<>();
        Object usuario = session.getAttribute("usuarioLogueado");

        for (Product p : products) {
            Map<String, Object> map = new HashMap<>();

            map.put("idBarcode", p.getIdBarcode());
            map.put("name", p.getName());
            map.put("brand", p.getBrand());
            map.put("price", p.getPrice());
            map.put("images", p.getImages());
            map.put("active", p.getActive());
            map.put("category", p.getCategory() != null ? p.getCategory().getName() : null);

            // 🔥 OBTENER CALIFICACIONES Y CONTROLAR EL NULL
            Double avg = ratingService.getAverageRating(p.getIdBarcode());
            Long total = ratingService.getTotalRatings(p.getIdBarcode());

            map.put("averageRating", avg != null ? avg : 0.0);
            map.put("totalRatings", total != null ? total : 0L);

            boolean enWishlist = false;
            if (usuario instanceof uptc.edu.swi.glowglam.model.Client cliente) {
                enWishlist = wishlistService.isInWishlist(cliente.getId(), p.getIdBarcode());
            }
            map.put("inWishlist", enWishlist);

            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    // =========================
    // 🔍 GET BY BARCODE
    // =========================
  // =========================
    // 🔍 GET BY BARCODE (Corregido para enviar la descripción)
    // =========================
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<Map<String, Object>> findByBarcode(
            @PathVariable String barcode,
            HttpSession session) {

        Product product = productService.findByBarcode(barcode);

        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();

        // 🔥 Pon todo directo en la raíz igual que en findAll
        response.put("idBarcode", product.getIdBarcode());
        response.put("name", product.getName());
        response.put("brand", product.getBrand());
        
        // 🚀 CORRECCIÓN: Agregamos la descripción que faltaba en el mapeo
        response.put("description", product.getDescription()); 
        
        response.put("price", product.getPrice());
        response.put("images", product.getImages());
        response.put("active", product.getActive());
        response.put("category", product.getCategory() != null ? product.getCategory().getName() : null);

        response.put("averageRating", ratingService.getAverageRating(barcode));
        response.put("totalRatings", ratingService.getTotalRatings(barcode));

        boolean enWishlist = false;
        Object usuario = session.getAttribute("usuarioLogueado");
        if (usuario instanceof uptc.edu.swi.glowglam.model.Client cliente) {
            enWishlist = wishlistService.isInWishlist(cliente.getId(), barcode);
        }
        response.put("inWishlist", enWishlist);

        return ResponseEntity.ok(response);
    }

    // =========================
    // 🧾 GET BY CATEGORY
    // =========================
    @GetMapping("/category")
    public ResponseEntity<List<Product>> findByCategory(@RequestParam("name") String categoryName) {
        return ResponseEntity.ok(productService.findByCategory(categoryName));
    }

    // =========================
    // ➕ CREATE PRODUCT
    // =========================
    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody ProductRequest request) {
        try {
            Product product = request.getProduct();
            List<String> imageUrls = request.getImageUrls();

            List<Image> images = buildImages(product, imageUrls);
            product.setImages(images);

            boolean saved = productService.save(product);

            if (saved) {
                return ResponseEntity.status(HttpStatus.CREATED).body(product);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("El producto ya existe.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al guardar producto.");
        }
    }

    // =========================
    // ✏️ UPDATE PRODUCT
    // =========================
    @PutMapping
    public ResponseEntity<?> updateProduct(@RequestBody ProductRequest request) {
        try {
            Product product = request.getProduct();
            List<String> imageUrls = request.getImageUrls();

            List<Image> images = buildImages(product, imageUrls);
            product.setImages(images);

            productService.update(product);

            return ResponseEntity.ok(product);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar producto.");
        }
    }

    // =========================
    // ❌ DELETE PRODUCT
    // =========================
    @DeleteMapping("/{barcode}")
    public ResponseEntity<?> deleteProduct(@PathVariable String barcode) {
        try {
            productService.deleteProductByBarcode(barcode);
            return ResponseEntity.ok("Producto eliminado correctamente.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar producto.");
        }
    }

    // =========================
    // 🔄 CHANGE STATUS
    // =========================
    @PatchMapping("/status")
    public ResponseEntity<Boolean> setStatus(
            @RequestParam String barcode,
            @RequestParam boolean active) {

        try {
            return ResponseEntity.ok(productService.setActive(barcode, active));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    // =========================
    // 🔐 ADMIN ENDPOINT
    // =========================
    @GetMapping("/admin/all")
    public ResponseEntity<?> findAllProductsForAdmin(@RequestParam("role") String role) {

        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Acceso no autorizado.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        return ResponseEntity.ok(productService.findAll());
    }

    // =========================
    // 🧠 HELPER: BUILD IMAGES
    // =========================
    private List<Image> buildImages(Product product, List<String> urls) {

        List<Image> images = new ArrayList<>();

        if (urls == null)
            return images;

        for (int i = 0; i < urls.size(); i++) {

            String url = urls.get(i);

            if (url != null && !url.trim().isEmpty()) {

                Image img = new Image();
                img.setImageUrl(url.trim());
                img.setPrimary(i == 0);
                img.setProduct(product);

                images.add(img);
            }
        }

        return images;
    }

    // =========================
    // 📦 DTO REQUEST
    // =========================
    public static class ProductRequest {

        private Product product;
        private List<String> imageUrls;

        public Product getProduct() {
            return product;
        }

        public void setProduct(Product product) {
            this.product = product;
        }

        public List<String> getImageUrls() {
            return imageUrls;
        }

        public void setImageUrls(List<String> imageUrls) {
            this.imageUrls = imageUrls;
        }
    }
}