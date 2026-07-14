package uptc.edu.swi.glowglam.service;

import uptc.edu.swi.glowglam.model.Product;
import java.util.List;

public interface IProductService {
    List<Product> findAll();
    Product findByBarcode(String barcode);
    boolean save(Product product);
    boolean update(Product product);
    boolean deleteProductByBarcode(String barcode);
    List<Product> findByCategory(String categoryName);
    boolean setActive(String barcode, boolean active);

    // Agrega esto dentro de tu interfaz IProductService
List<Product> findActiveProducts();
}
