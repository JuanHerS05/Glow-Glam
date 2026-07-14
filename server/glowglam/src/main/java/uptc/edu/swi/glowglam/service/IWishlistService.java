package uptc.edu.swi.glowglam.service;

import uptc.edu.swi.glowglam.model.Client;
import uptc.edu.swi.glowglam.model.Wishlist;
import java.util.List;

public interface IWishlistService {
    
    boolean toggleWishlist(Client client, String barcode);
    List<Wishlist> getWishlistByClient(Long clientId);
    boolean isInWishlist(Long clientId, String barcode);
}