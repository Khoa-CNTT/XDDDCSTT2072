package com.agricultural.agricultural.service.recommendation;

import com.agricultural.agricultural.entity.UserProductInteraction;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class CollaborativeFilter {


    public double calculateUserSimilarity(List<UserProductInteraction> user1Interactions,
                                        List<UserProductInteraction> user2Interactions) {
        Map<Integer, Double> user1Scores = createUserScoreMap(user1Interactions);
        Map<Integer, Double> user2Scores = createUserScoreMap(user2Interactions);

        Set<Integer> commonProducts = new HashSet<>(user1Scores.keySet());
        commonProducts.retainAll(user2Scores.keySet());

        if (commonProducts.isEmpty()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (Integer productId : commonProducts) {
            double score1 = user1Scores.get(productId);
            double score2 = user2Scores.get(productId);
            
            dotProduct += score1 * score2;
            norm1 += score1 * score1;
            norm2 += score2 * score2;
        }

        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }


    private Map<Integer, Double> createUserScoreMap(List<UserProductInteraction> interactions) {
        return interactions.stream()
            .collect(Collectors.groupingBy(
                UserProductInteraction::getProductId,
                Collectors.summingDouble(interaction -> 
                    interaction.getInteractionScore() * interaction.getInteractionCount()
                )
            ));
    }


    public double predictUserProductScore(Integer userId, Integer productId,
                                        List<UserProductInteraction> userInteractions,
                                        Map<Integer, List<UserProductInteraction>> allUserInteractions) {
        Map<Integer, Double> userSimilarities = new HashMap<>();
        
        for (Map.Entry<Integer, List<UserProductInteraction>> entry : allUserInteractions.entrySet()) {
            if (!entry.getKey().equals(userId)) {
                double similarity = calculateUserSimilarity(userInteractions, entry.getValue());
                if (similarity > 0) {
                    userSimilarities.put(entry.getKey(), similarity);
                }
            }
        }

        if (userSimilarities.isEmpty()) {
            return 0.0;
        }

        double scoreSum = 0.0;
        double similaritySum = 0.0;

        for (Map.Entry<Integer, Double> entry : userSimilarities.entrySet()) {
            Integer similarUserId = entry.getKey();
            Double similarity = entry.getValue();
            
            Optional<UserProductInteraction> interaction = allUserInteractions.get(similarUserId)
                .stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst();
                
            if (interaction.isPresent()) {
                double score = interaction.get().getInteractionScore() * interaction.get().getInteractionCount();
                scoreSum += score * similarity;
                similaritySum += similarity;
            }
        }

        return similaritySum == 0 ? 0 : scoreSum / similaritySum;
    }
} 