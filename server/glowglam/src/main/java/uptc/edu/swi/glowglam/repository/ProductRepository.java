package uptc.edu.swi.glowglam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import uptc.edu.swi.glowglam.model.Product;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {

    // Buscar productos filtrando por el nombre de la categoría (Equivale a tu JOIN manual)
    @Query("from Product  WHERE category.name = ?1")
    List<Product> buscarPorCategoria(String categoryName);

    List<Product> findByActiveTrue();
}