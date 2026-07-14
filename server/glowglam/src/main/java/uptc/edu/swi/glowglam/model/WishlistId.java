package uptc.edu.swi.glowglam.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class WishlistId implements Serializable {
    private Long clientId;
    private String productBarcode;

    public WishlistId() {}

    public WishlistId(Long clientId, String productBarcode) {
        this.clientId = clientId;
        this.productBarcode = productBarcode;
    }

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    public String getProductBarcode() { return productBarcode; }
    public void setProductBarcode(String productBarcode) { this.productBarcode = productBarcode; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof WishlistId)) return false;
        WishlistId that = (WishlistId) o;
        return Objects.equals(clientId, that.clientId) && Objects.equals(productBarcode, that.productBarcode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(clientId, productBarcode);
    }
}
