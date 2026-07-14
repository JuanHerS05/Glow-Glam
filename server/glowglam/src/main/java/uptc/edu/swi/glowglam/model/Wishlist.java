package uptc.edu.swi.glowglam.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "wishlists")
public class Wishlist {

    @EmbeddedId
    private WishlistId id = new WishlistId();

    @ManyToOne
    @MapsId("clientId")
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @MapsId("productBarcode")
    @JoinColumn(name = "product_barcode")
    private Product product;

    @Column(name = "added_at")
    private LocalDateTime addedAt = LocalDateTime.now();

    public Wishlist() {}

    public Wishlist(Client client, Product product) {
        this.client = client;
        this.product = product;
        this.id = new WishlistId(client.getId(), product.getIdBarcode());
    }

    public WishlistId getId() { return id; }
    public void setId(WishlistId id) { this.id = id; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
