package uptc.edu.swi.glowglam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uptc.edu.swi.glowglam.model.Rating;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    // Cambiado a double primitivo para evitar NullPointerException en el service
    @Query("SELECT COALESCE(AVG(r.score), 0.0) FROM Rating r WHERE r.product.idBarcode = :barcode")
    double getAverageRatingByProduct(String barcode); 
    
    // Cambiado a long primitivo por consistencia y limpieza (sin @Param)
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.product.idBarcode = :barcode")
    long countRatingsByProduct(String barcode);
}