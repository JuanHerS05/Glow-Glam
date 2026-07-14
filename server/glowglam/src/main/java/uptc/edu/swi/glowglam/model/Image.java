package uptc.edu.swi.glowglam.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "images")
public class Image {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idImage;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_barcode", nullable = false)
    @JsonIgnore
    private Product product;
    
    // CAMBIO: De byte[] LONGBLOB a String VARCHAR
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;
    
    private boolean isPrimary;

    public Image() {
    }

    // Constructor actualizado
    public Image(Product product, String imageUrl, boolean isPrimary) {
        this.product = product;
        this.imageUrl = imageUrl;
        this.isPrimary = isPrimary;
    }

    public Image(int idImage, Product product, String imageUrl, boolean isPrimary) {
        this.idImage = idImage;
        this.product = product;
        this.imageUrl = imageUrl;
        this.isPrimary = isPrimary;
    }

    // Getters y Setters actualizados
    public int getIdImage() { return idImage; }
    public void setIdImage(int idImage) { this.idImage = idImage; }
    
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public boolean isPrimary() { return isPrimary; }
    public void setPrimary(boolean isPrimary) { this.isPrimary = isPrimary; }
}