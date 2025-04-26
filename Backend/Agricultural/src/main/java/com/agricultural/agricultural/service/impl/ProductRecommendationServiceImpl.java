package com.agricultural.agricultural.service.impl;
import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.ProductRelationship;
import com.agricultural.agricultural.entity.UserProductInteraction;
import com.agricultural.agricultural.entity.UserProductInteraction.InteractionType;
import com.agricultural.agricultural.entity.ProductRelationship.RelationshipType;
import com.agricultural.agricultural.mapper.MarketPlaceMapper;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.repository.IProductRelationshipRepository;
import com.agricultural.agricultural.repository.IUserProductInteractionRepository;
import com.agricultural.agricultural.service.IProductRecommendationService;
import com.agricultural.agricultural.service.recommendation.CollaborativeFilter;
import com.agricultural.agricultural.service.recommendation.ContentBasedFilter;
import com.agricultural.agricultural.service.recommendation.SeasonalAnalyzer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductRecommendationServiceImpl implements IProductRecommendationService {

    private final IUserProductInteractionRepository interactionRepository;
    private final IProductRelationshipRepository relationshipRepository;
    private final IMarketPlaceRepository marketPlaceRepository;
    private final MarketPlaceMapper marketPlaceMapper;
    private final CollaborativeFilter collaborativeFilter;
    private final ContentBasedFilter contentBasedFilter;
    private final SeasonalAnalyzer seasonalAnalyzer;
    
    // Điểm số tương tác
    private static final Map<InteractionType, Integer> INTERACTION_SCORES = Map.of(
        InteractionType.VIEW, 1,
        InteractionType.CART, 2,
        InteractionType.WISHLIST, 3,
        InteractionType.REVIEW, 4,
        InteractionType.PURCHASE, 5
    );

    @Override
    public Page<MarketPlaceDTO> getPersonalizedRecommendations(Integer userId, Pageable pageable) {
        log.info("Lấy danh sách gợi ý cá nhân hóa cho người dùng ID: {}", userId);
        
        // Lấy danh sách sản phẩm người dùng đã tương tác
        List<Object[]> userInteractions = interactionRepository.findMostInteractedProductsByUser(userId, 10);
        
        if (userInteractions.isEmpty()) {
            log.info("Không có dữ liệu tương tác cho người dùng ID: {}. Trả về sản phẩm phổ biến", userId);
            return getTrendingProducts(pageable);
        }
        
        Set<Integer> recommendedProductIds = new HashSet<>();
        Set<Integer> interactedProductIds = new HashSet<>();
        
        for (Object[] interaction : userInteractions) {
            Integer marketplaceId = ((Number) interaction[0]).intValue();
            interactedProductIds.add(marketplaceId);
            
            List<ProductRelationship> similarProducts = relationshipRepository
                .findBySourceProductIdAndRelationshipType(marketplaceId, RelationshipType.SIMILAR);
                
            for (ProductRelationship relation : similarProducts) {
                recommendedProductIds.add(relation.getTargetProductId());
            }
            
            List<ProductRelationship> boughtTogether = relationshipRepository
                .findFrequentlyBoughtTogether(marketplaceId, 5);
                
            for (ProductRelationship relation : boughtTogether) {
                recommendedProductIds.add(relation.getTargetProductId());
            }
        }
        
        recommendedProductIds.removeAll(interactedProductIds);
        
        if (recommendedProductIds.isEmpty()) {
            log.info("Không tìm được gợi ý cho người dùng ID: {}. Trả về sản phẩm phổ biến", userId);
            return getTrendingProducts(pageable);
        }
        
        List<MarketPlace> recommendedProducts = marketPlaceRepository.findAllById(recommendedProductIds);
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), recommendedProducts.size());
        
        List<MarketPlace> pagedProducts = recommendedProducts.subList(start, end);
        
        List<MarketPlaceDTO> result = pagedProducts.stream()
            .map(marketPlaceMapper::toDTO)
            .collect(Collectors.toList());
            
        return new PageImpl<>(result, pageable, recommendedProducts.size());
    }

    @Override
    public Page<MarketPlaceDTO> getSimilarProducts(Integer marketplaceId, Pageable pageable) {
        log.info("Lấy danh sách sản phẩm tương tự với sản phẩm ID: {}", marketplaceId);
        
        if (!marketPlaceRepository.existsById(marketplaceId)) {
            log.warn("Sản phẩm không tồn tại với ID: {}", marketplaceId);
            return Page.empty(pageable);
        }
        
        Page<ProductRelationship> relationships = relationshipRepository.findSimilarProducts(marketplaceId, pageable);
        
        if (relationships.isEmpty()) {
            log.info("Không tìm thấy sản phẩm tương tự cho sản phẩm ID: {}", marketplaceId);
            return Page.empty(pageable);
        }
        
        List<Integer> similarProductIds = relationships.getContent().stream()
            .map(ProductRelationship::getTargetProductId)
            .collect(Collectors.toList());
            
        List<MarketPlace> similarProducts = marketPlaceRepository.findAllById(similarProductIds);
        
        Map<Integer, Integer> orderMap = new HashMap<>();
        for (int i = 0; i < similarProductIds.size(); i++) {
            orderMap.put(similarProductIds.get(i), i);
        }
        
        similarProducts.sort(Comparator.comparing(p -> orderMap.getOrDefault(p.getId(), Integer.MAX_VALUE)));
        
        List<MarketPlaceDTO> result = similarProducts.stream()
            .map(marketPlaceMapper::toDTO)
            .collect(Collectors.toList());
            
        return new PageImpl<>(result, pageable, relationships.getTotalElements());
    }

    @Override
    public List<MarketPlaceDTO> getFrequentlyBoughtTogether(Integer marketplaceId, int limit) {
        log.info("Lấy danh sách sản phẩm thường được mua cùng với sản phẩm ID: {}", marketplaceId);
        
        if (!marketPlaceRepository.existsById(marketplaceId)) {
            log.warn("Sản phẩm không tồn tại với ID: {}", marketplaceId);
            return Collections.emptyList();
        }
        
        List<ProductRelationship> relationships = relationshipRepository.findFrequentlyBoughtTogether(marketplaceId, limit);
        
        if (relationships.isEmpty()) {
            log.info("Không tìm thấy sản phẩm thường mua cùng với sản phẩm ID: {}", marketplaceId);
            return Collections.emptyList();
        }
        
        List<Integer> relatedProductIds = relationships.stream()
            .map(ProductRelationship::getTargetProductId)
            .collect(Collectors.toList());
            
        List<MarketPlace> relatedProducts = marketPlaceRepository.findAllById(relatedProductIds);
        
        Map<Integer, Integer> orderMap = new HashMap<>();
        for (int i = 0; i < relatedProductIds.size(); i++) {
            orderMap.put(relatedProductIds.get(i), i);
        }
        
        relatedProducts.sort(Comparator.comparing(p -> orderMap.getOrDefault(p.getId(), Integer.MAX_VALUE)));
        
        return relatedProducts.stream()
            .map(marketPlaceMapper::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public Page<MarketPlaceDTO> getTrendingProducts(Pageable pageable) {
        log.info("Lấy danh sách sản phẩm xu hướng");
        
        List<Object[]> trendingProductsData = interactionRepository.findProductsWithHighestInteractionScore(50);
        
        if (trendingProductsData.isEmpty()) {
            log.info("Không có dữ liệu xu hướng. Trả về sản phẩm phổ biến");
            return marketPlaceRepository.findPopularProducts(pageable)
                .map(marketPlaceMapper::toDTO);
        }
        
        List<Integer> trendingProductIds = trendingProductsData.stream()
            .map(data -> ((Number) data[0]).intValue())
            .collect(Collectors.toList());
            
        List<MarketPlace> trendingProducts = marketPlaceRepository.findAllById(trendingProductIds);
        
        Map<Integer, Integer> orderMap = new HashMap<>();
        for (int i = 0; i < trendingProductIds.size(); i++) {
            orderMap.put(trendingProductIds.get(i), i);
        }
        
        trendingProducts.sort(Comparator.comparing(p -> orderMap.getOrDefault(p.getId(), Integer.MAX_VALUE)));
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), trendingProducts.size());
        
        if (start >= trendingProducts.size()) {
            return Page.empty(pageable);
        }
        
        List<MarketPlace> pagedProducts = trendingProducts.subList(start, end);
        
        List<MarketPlaceDTO> result = pagedProducts.stream()
            .map(marketPlaceMapper::toDTO)
            .collect(Collectors.toList());
            
        return new PageImpl<>(result, pageable, trendingProducts.size());
    }

    @Override
    @Transactional
    public void recordProductView(Integer userId, Integer marketplaceId) {
        log.info("Ghi nhận lượt xem sản phẩm ID: {} bởi người dùng ID: {}", marketplaceId, userId);
        
        UserProductInteraction interaction = interactionRepository
            .findByUserIdAndProductIdAndType(userId, marketplaceId, InteractionType.VIEW)
            .orElse(new UserProductInteraction());
            
        if (interaction.getId() == null) {
            interaction.setUserId(userId);
            interaction.setProductId(marketplaceId);
            interaction.setType(InteractionType.VIEW);
            interaction.setInteractionScore(INTERACTION_SCORES.get(InteractionType.VIEW));
            interaction.setInteractionCount(1);
        } else {
            interaction.incrementInteractionCount();
        }
        
        interactionRepository.save(interaction);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 1 * * ?") // 1:00 AM mỗi ngày
    public void updateRecommendationModels() {
        log.info("Bắt đầu cập nhật mô hình gợi ý sản phẩm");
        
        try {
            updateSimilarProducts();
            updateBoughtTogetherProducts();
            updateViewedTogetherProducts();
            
            log.info("Cập nhật mô hình gợi ý sản phẩm thành công");
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật mô hình gợi ý sản phẩm", e);
        }
    }
    
    private void updateSimilarProducts() {
        log.info("Cập nhật mối quan hệ SIMILAR giữa các sản phẩm");
        
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        
        for (int i = 0; i < allProducts.size(); i++) {
            MarketPlace product1 = allProducts.get(i);
            
            for (int j = i + 1; j < allProducts.size(); j++) {
                MarketPlace product2 = allProducts.get(j);
                
                float similarityScore = calculateSimilarityScore(product1, product2);
                
                if (similarityScore > 0.5) {
                    updateOrCreateRelationship(
                        product1.getId(), product2.getId(), 
                        RelationshipType.SIMILAR, similarityScore, 1
                    );
                    
                    updateOrCreateRelationship(
                        product2.getId(), product1.getId(), 
                        RelationshipType.SIMILAR, similarityScore, 1
                    );
                }
            }
        }
    }
    
    private void updateBoughtTogetherProducts() {
        log.info("Cập nhật mối quan hệ BOUGHT_TOGETHER giữa các sản phẩm");
        
        List<UserProductInteraction> purchaseInteractions = interactionRepository.findAll().stream()
            .filter(i -> i.getType() == InteractionType.PURCHASE)
            .collect(Collectors.toList());
            
        Map<Integer, List<Integer>> userPurchases = new HashMap<>();
        
        for (UserProductInteraction interaction : purchaseInteractions) {
            userPurchases
                .computeIfAbsent(interaction.getUserId(), k -> new ArrayList<>())
                .add(interaction.getProductId());
        }
        
        Map<String, Integer> coOccurrences = new HashMap<>();
        
        for (List<Integer> products : userPurchases.values()) {
            if (products.size() > 1) {
                for (int i = 0; i < products.size(); i++) {
                    for (int j = i + 1; j < products.size(); j++) {
                        Integer productA = products.get(i);
                        Integer productB = products.get(j);
                        
                        String keyAB = productA + "-" + productB;
                        String keyBA = productB + "-" + productA;
                        
                        coOccurrences.put(keyAB, coOccurrences.getOrDefault(keyAB, 0) + 1);
                        coOccurrences.put(keyBA, coOccurrences.getOrDefault(keyBA, 0) + 1);
                    }
                }
            }
        }
        
        for (Map.Entry<String, Integer> entry : coOccurrences.entrySet()) {
            String[] products = entry.getKey().split("-");
            Integer sourceId = Integer.parseInt(products[0]);
            Integer targetId = Integer.parseInt(products[1]);
            Integer occurrenceCount = entry.getValue();
            
            float strengthScore = Math.min(1.0f, occurrenceCount / 10.0f);
            
            updateOrCreateRelationship(
                sourceId, targetId, RelationshipType.BOUGHT_TOGETHER, 
                strengthScore, occurrenceCount
            );
        }
    }
    
    private void updateViewedTogetherProducts() {
        log.info("Cập nhật mối quan hệ VIEWED_TOGETHER giữa các sản phẩm");
        
        List<UserProductInteraction> viewInteractions = interactionRepository.findAll().stream()
            .filter(i -> i.getType() == InteractionType.VIEW)
            .collect(Collectors.toList());
            
        Map<Integer, List<Integer>> userViews = new HashMap<>();
        
        for (UserProductInteraction interaction : viewInteractions) {
            userViews
                .computeIfAbsent(interaction.getUserId(), k -> new ArrayList<>())
                .add(interaction.getProductId());
        }
        
        Map<String, Integer> coOccurrences = new HashMap<>();
        
        for (List<Integer> products : userViews.values()) {
            if (products.size() > 1) {
                for (int i = 0; i < products.size(); i++) {
                    for (int j = i + 1; j < products.size(); j++) {
                        Integer productA = products.get(i);
                        Integer productB = products.get(j);
                        
                        String keyAB = productA + "-" + productB;
                        String keyBA = productB + "-" + productA;
                        
                        coOccurrences.put(keyAB, coOccurrences.getOrDefault(keyAB, 0) + 1);
                        coOccurrences.put(keyBA, coOccurrences.getOrDefault(keyBA, 0) + 1);
                    }
                }
            }
        }
        
        for (Map.Entry<String, Integer> entry : coOccurrences.entrySet()) {
            String[] products = entry.getKey().split("-");
            Integer sourceId = Integer.parseInt(products[0]);
            Integer targetId = Integer.parseInt(products[1]);
            Integer occurrenceCount = entry.getValue();
            
            float strengthScore = Math.min(1.0f, occurrenceCount / 20.0f);
            
            updateOrCreateRelationship(
                sourceId, targetId, RelationshipType.VIEWED_TOGETHER, 
                strengthScore, occurrenceCount
            );
        }
    }
    
    private void updateOrCreateRelationship(
            Integer sourceId, Integer targetId, 
            RelationshipType type, float strengthScore, 
            Integer occurrenceCount) {
        
        if (sourceId.equals(targetId)) {
            return;
        }
        
        Optional<ProductRelationship> existingRelation = relationshipRepository
            .findBySourceProductIdAndTargetProductIdAndRelationshipType(sourceId, targetId, type);
            
        if (existingRelation.isPresent()) {
            ProductRelationship relation = existingRelation.get();
            relation.updateStrengthScore(strengthScore);
            relation.setOccurrenceCount(relation.getOccurrenceCount() + occurrenceCount);
            relationshipRepository.save(relation);
        } else {
            ProductRelationship relation = ProductRelationship.builder()
                .sourceProductId(sourceId)
                .targetProductId(targetId)
                .relationshipType(type)
                .strengthScore(strengthScore)
                .occurrenceCount(occurrenceCount)
                .build();
                
            relationshipRepository.save(relation);
        }
    }
    
    private float calculateSimilarityScore(MarketPlace product1, MarketPlace product2) {
        float score = 0.0f;
        int factors = 0;
        
        if (product1.getCategory() != null && product1.getCategory().equals(product2.getCategory())) {
            score += 0.6f;
            factors++;
        }
        
        if (product1.getPrice() != null && product2.getPrice() != null) {
            float priceDiff = Math.abs(product1.getPrice().floatValue() - product2.getPrice().floatValue());
            float maxPrice = Math.max(product1.getPrice().floatValue(), product2.getPrice().floatValue());
            
            if (maxPrice > 0) {
                float priceSimScore = Math.max(0, 1 - (priceDiff / maxPrice));
                score += 0.3f * priceSimScore;
                factors++;
            }
        }
        
        if (product1.getUser() != null && product1.getUser().equals(product2.getUser())) {
            score += 0.1f;
            factors++;
        }
        
        return factors > 0 ? (score / factors) : 0;
    }

    @Override
    public Page<MarketPlaceDTO> getSeasonalProducts(Pageable pageable) {
        log.info("Lấy danh sách nông sản theo mùa vụ hiện tại");
        
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        List<MarketPlace> seasonalProducts = allProducts.stream()
            .filter(product -> seasonalAnalyzer.isInSeason(product, now))
            .collect(Collectors.toList());
            
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), seasonalProducts.size());
        
        if (start >= seasonalProducts.size()) {
            return Page.empty(pageable);
        }
        
        List<MarketPlace> pagedProducts = seasonalProducts.subList(start, end);
        
        List<MarketPlaceDTO> result = pagedProducts.stream()
            .map(marketPlaceMapper::toDTO)
            .collect(Collectors.toList());
            
        return new PageImpl<>(result, pageable, seasonalProducts.size());
    }

    @Override
    public Page<MarketPlaceDTO> getUpcomingSeasonalProducts(Pageable pageable) {
        log.info("Lấy danh sách nông sản sắp vào mùa vụ");
        
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nearFuture = now.plusMonths(1); // Xem trước 1 tháng
        
        List<MarketPlace> upcomingProducts = allProducts.stream()
            .filter(product -> !seasonalAnalyzer.isInSeason(product, now) && 
                              seasonalAnalyzer.isInSeason(product, nearFuture))
            .collect(Collectors.toList());
            
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), upcomingProducts.size());
        
        if (start >= upcomingProducts.size()) {
            return Page.empty(pageable);
        }
        
        List<MarketPlace> pagedProducts = upcomingProducts.subList(start, end);
        
        List<MarketPlaceDTO> result = pagedProducts.stream()
            .map(marketPlaceMapper::toDTO)
            .collect(Collectors.toList());
            
        return new PageImpl<>(result, pageable, upcomingProducts.size());
    }
} 