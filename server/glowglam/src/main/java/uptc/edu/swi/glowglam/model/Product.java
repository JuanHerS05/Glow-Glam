package uptc.edu.swi.glowglam.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    private String idBarcode;

    @ManyToOne
    @JoinColumn(name = "category_name")
    private Category category; // Cambiado de String a objeto Category

    private String name;
    private String brand;
    @Column(columnDefinition = "TEXT")
    private String description;
    private double price;
    private boolean active;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> images = new ArrayList<>();

    public Product() {
    }

    public Product(String idBarcode, Category category, String name, String brand, String description, double price,
            boolean active, List<Image> images) {
        this.idBarcode = idBarcode;
        this.category = category;
        this.name = name;
        this.brand = brand;
        this.description = description;
        this.price = price;
        this.active = active;
        this.images = images;
    }

    // Getters y Setters...
    public String getIdBarcode() {
        return idBarcode;
    }

    public void setIdBarcode(String idBarcode) {
        this.idBarcode = idBarcode;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public boolean getActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<Image> getImages() {
        return images;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }
}