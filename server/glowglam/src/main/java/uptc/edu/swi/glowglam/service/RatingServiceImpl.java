package uptc.edu.swi.glowglam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptc.edu.swi.glowglam.model.Rating;
import uptc.edu.swi.glowglam.repository.RatingRepository;

@Service
public class RatingServiceImpl implements IRatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Override
    @Transactional(readOnly = true)
    public Double getAverageRating(String barcode) {
        return ratingRepository.getAverageRatingByProduct(barcode);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getTotalRatings(String barcode) {
        return ratingRepository.countRatingsByProduct(barcode);
    }

    @Override
    @Transactional
    public void saveRating(Rating rating) {
        ratingRepository.save(rating);
    }
}