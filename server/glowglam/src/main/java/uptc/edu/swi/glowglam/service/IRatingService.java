package uptc.edu.swi.glowglam.service;

import uptc.edu.swi.glowglam.model.Rating;

public interface IRatingService {
    Double getAverageRating(String barcode);
    Long getTotalRatings(String barcode);
    void saveRating(Rating rating);
}
