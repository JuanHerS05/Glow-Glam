package uptc.edu.swi.glowglam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptc.edu.swi.glowglam.model.*;
import uptc.edu.swi.glowglam.repository.ProductRepository;
import uptc.edu.swi.glowglam.repository.WishlistRepository;
import java.util.List;

@Service
public class WishlistServiceImpl implements IWishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional
    public boolean toggleWishlist(Client client, String barcode) {
        WishlistId id = new WishlistId(client.getId(), barcode);
        
        if (wishlistRepository.existsById(id)) {
            wishlistRepository.deleteById(id);
            return false; // Se eliminó de la lista
        } else {
            Product product = productRepository.findById(barcode).orElse(null);
            if (product != null) {
                Wishlist wishlist = new Wishlist(client, product);
                wishlistRepository.save(wishlist);
                return true; // Se añadió a la lista
            }
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Wishlist> getWishlistByClient(Long clientId) {
        return wishlistRepository.findByClientId(clientId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(Long clientId, String barcode) {
        return wishlistRepository.existsById(new WishlistId(clientId, barcode));
    }
}
