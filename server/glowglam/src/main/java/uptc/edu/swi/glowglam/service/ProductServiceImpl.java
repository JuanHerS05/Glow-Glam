package uptc.edu.swi.glowglam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptc.edu.swi.glowglam.model.Product;
import uptc.edu.swi.glowglam.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements IProductService {

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Product findByBarcode(String barcode) {
        // En JPA las búsquedas devuelven un Optional por seguridad frente a nulos
        return productRepository.findById(barcode).orElse(null);
    }

    @Override
    @Transactional
    public boolean save(Product product) {
        // Validación de existencia previa
        if (productRepository.existsById(product.getIdBarcode())) {
            System.out.println("El producto ya existe");
            return false;
        }
        // Al guardar el producto, JPA insertará sus imágenes automáticamente por el CascadeType.ALL
        productRepository.save(product);
        return true;
    }

    @Override
    @Transactional
    public boolean update(Product product) {
        if (productRepository.existsById(product.getIdBarcode())) {
            // En Spring Data JPA, .save() actúa como INSERT si no existe el ID, o como UPDATE si el ID ya existe
            productRepository.save(product);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public boolean deleteProductByBarcode(String barcode) {
        if (productRepository.existsById(barcode)) {
            productRepository.deleteById(barcode);
            return true;
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> findByCategory(String categoryName) {
        return productRepository.buscarPorCategoria(categoryName);
    }

    @Override
    @Transactional
    public boolean setActive(String barcode, boolean active) {
        Optional<Product> optionalProduct = productRepository.findById(barcode);
        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            product.setActive(active);
            productRepository.save(product); // Sincroniza el cambio de estado en la BD
            return true;
        }
        return false;
    }

    @Override
@Transactional(readOnly = true)
public List<Product> findActiveProducts() {
    return productRepository.findByActiveTrue();
}
}