package uptc.edu.swi.glowglam.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ratings")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el producto usando el código de barras existente
    @ManyToOne
    @JoinColumn(name = "product_barcode", nullable = false)
    private Product product;

    // Relación con el cliente usando el ID numérico heredado de Role
    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(nullable = false)
    private int score; // Puntuación (ej. de 1 a 5)

    @Column(columnDefinition = "TEXT")
    private String comment; // Opcional por si quieren dejar reseña

    public Rating() {
    }

    public Rating(Product product, Client client, int score, String comment) {
        this.product = product;
        this.client = client;
        this.score = score;
        this.comment = comment;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
