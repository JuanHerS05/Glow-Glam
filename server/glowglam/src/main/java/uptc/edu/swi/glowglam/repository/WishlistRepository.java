package uptc.edu.swi.glowglam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uptc.edu.swi.glowglam.model.Wishlist;
import uptc.edu.swi.glowglam.model.WishlistId;
import java.util.List;

public interface WishlistRepository extends JpaRepository<Wishlist, WishlistId> {
    List<Wishlist> findByClientId(Long clientId);
    boolean existsById(WishlistId id);
}