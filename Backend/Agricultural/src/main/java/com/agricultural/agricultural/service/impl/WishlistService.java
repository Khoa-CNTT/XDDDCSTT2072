package com.agricultural.agricultural.service.impl;
import com.agricultural.agricultural.dto.WishlistDTO;
import com.agricultural.agricultural.dto.WishlistItemDTO;
import com.agricultural.agricultural.entity.*;
import com.agricultural.agricultural.entity.UserProductInteraction.InteractionType;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.agricultural.agricultural.utils.ResponseObject;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final IWishlistRepository wishlistRepository;
    private final IWishlistItemRepository wishlistItemRepository;
    private final IUserRepository userRepository;
    private final IMarketPlaceRepository marketPlaceRepository;
    private final IProductVariantRepository productVariantRepository;
    private final IUserProductInteractionRepository userProductInteractionRepository;


    public ResponseEntity<?> getUserWishlists(Integer userId) {
        List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);
        List<WishlistDTO> wishlistDTOs = wishlists.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(wishlistDTOs);
    }


    public ResponseEntity<?> getWishlistById(Integer wishlistId, Integer userId) {
        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist không tồn tại hoặc không thuộc về người dùng này"));

        List<WishlistItem> items = wishlistItemRepository.findByWishlistIdWithProducts(wishlistId);
        
        WishlistDTO wishlistDTO = convertToDTO(wishlist);
        wishlistDTO.setItems(convertItemsToDTO(items));
        wishlistDTO.setItemCount(items.size());
        
        return ResponseEntity.ok(wishlistDTO);
    }


    @Transactional
    public ResponseEntity<?> createWishlist(WishlistDTO wishlistDTO) {
        User user = userRepository.findById(wishlistDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));

        // Check if name is provided
        if (wishlistDTO.getName() == null || wishlistDTO.getName().trim().isEmpty()) {
            throw new BadRequestException("Tên danh sách yêu thích không được để trống");
        }
        
        if (Boolean.TRUE.equals(wishlistDTO.getIsDefault()) &&
                wishlistRepository.existsByUserIdAndIsDefaultTrue(wishlistDTO.getUserId())) {
            throw new BadRequestException("Người dùng đã có danh sách yêu thích mặc định");
        }
        
        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .name(wishlistDTO.getName())
                .isDefault(wishlistDTO.getIsDefault() != null ? wishlistDTO.getIsDefault() : false)
                .build();
        
        wishlist = wishlistRepository.save(wishlist);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseObject.builder()
                        .status("SUCCESS")
                        .message("Tạo danh sách yêu thích thành công")
                        .data(convertToDTO(wishlist))
                        .build());
    }


    @Transactional
    public ResponseEntity<?> updateWishlist(Integer wishlistId, WishlistDTO wishlistDTO, Integer userId) {
        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Danh sách yêu thích không tồn tại hoặc không thuộc về người dùng này"));
        
        if (wishlistDTO.getName() == null || wishlistDTO.getName().trim().isEmpty()) {
            throw new BadRequestException("Tên danh sách yêu thích không được để trống");
        }
        
        if (!wishlist.getName().equals(wishlistDTO.getName()) &&
                wishlistRepository.existsByUserIdAndNameAndIdNot(userId, wishlistDTO.getName(), wishlistId)) {
            throw new BadRequestException("Tên danh sách yêu thích đã tồn tại");
        }
        
        if (Boolean.TRUE.equals(wishlistDTO.getIsDefault()) && !Boolean.TRUE.equals(wishlist.getIsDefault())) {
            Optional<Wishlist> defaultWishlist = wishlistRepository.findByUserIdAndIsDefaultTrue(userId);
            defaultWishlist.ifPresent(w -> {
                w.setIsDefault(false);
                wishlistRepository.save(w);
            });
        }
        
        wishlist.setName(wishlistDTO.getName());
        if (wishlistDTO.getIsDefault() != null) {
            wishlist.setIsDefault(wishlistDTO.getIsDefault());
        }
        
        wishlist = wishlistRepository.save(wishlist);
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("SUCCESS")
                .message("Cập nhật danh sách yêu thích thành công")
                .data(convertToDTO(wishlist))
                .build());
    }


    @Transactional
    public ResponseEntity<?> deleteWishlist(Integer wishlistId, Integer userId) {
        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Danh sách yêu thích không tồn tại hoặc không thuộc về người dùng này"));
        
        if (Boolean.TRUE.equals(wishlist.getIsDefault())) {
            throw new BadRequestException("Không thể xóa danh sách yêu thích mặc định");
        }
        
        wishlistRepository.delete(wishlist);
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("SUCCESS")
                .message("Xóa danh sách yêu thích thành công")
                .build());
    }


    @Transactional
    public ResponseEntity<?> addItemToWishlist(Integer wishlistId, WishlistItemDTO itemDTO, Integer userId) {
        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Danh sách yêu thích không tồn tại hoặc không thuộc về người dùng này"));
        
        MarketPlace product = marketPlaceRepository.findById(itemDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
        
        ProductVariant variant = null;
        if (itemDTO.getVariantId() != null) {
            variant = productVariantRepository.findById(itemDTO.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Biến thể sản phẩm không tồn tại"));
            
            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new BadRequestException("Biến thể không thuộc về sản phẩm này");
            }
        }
        
        if (itemDTO.getVariantId() == null) {
            if (wishlistItemRepository.existsByWishlistIdAndProductId(wishlistId, itemDTO.getProductId())) {
                throw new BadRequestException("Sản phẩm đã tồn tại trong danh sách yêu thích");
            }
        } else {
            Optional<WishlistItem> existingItem = wishlistItemRepository
                    .findByWishlistIdAndProductIdAndVariantId(wishlistId, itemDTO.getProductId(), itemDTO.getVariantId());
            if (existingItem.isPresent()) {
                throw new BadRequestException("Sản phẩm đã tồn tại trong danh sách yêu thích");
            }
        }
        
        WishlistItem item = WishlistItem.builder()
                .wishlist(wishlist)
                .product(product)
                .variant(variant)
                .build();
        
        item = wishlistItemRepository.save(item);
        
        recordProductInteraction(userId, product.getId(), InteractionType.WISHLIST);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseObject.builder()
                        .status("SUCCESS")
                        .message("Thêm sản phẩm vào danh sách yêu thích thành công")
                        .data(convertItemToDTO(item))
                        .build());
    }


    @Transactional
    public ResponseEntity<?> removeItemFromWishlist(Integer wishlistId, Integer itemId, Integer userId) {
        Wishlist wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Danh sách yêu thích không tồn tại hoặc không thuộc về người dùng này"));
        
        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong danh sách yêu thích"));
        
        if (!item.getWishlist().getId().equals(wishlistId)) {
            throw new BadRequestException("Sản phẩm không thuộc về danh sách yêu thích này");
        }
        
        wishlistItemRepository.delete(item);
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("SUCCESS")
                .message("Xóa sản phẩm khỏi danh sách yêu thích thành công")
                .build());
    }


    @Transactional
    public Wishlist createDefaultWishlist(Integer userId) {
        System.out.println("DEBUG - Creating default wishlist for user ID: " + userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        
        System.out.println("DEBUG - User found: " + user.getUsername() );
        
        Optional<Wishlist> defaultWishlist = wishlistRepository.findByUserIdAndIsDefaultTrue(userId);
        
        if (defaultWishlist.isPresent()) {
            System.out.println("DEBUG - Default wishlist already exists with ID: " + defaultWishlist.get().getId());
            return defaultWishlist.get();
        }
        
        System.out.println("DEBUG - Creating new default wishlist");
        
        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .name("Danh sách yêu thích") 
                .isDefault(true)
                .build();
        
        wishlist = wishlistRepository.save(wishlist);
        System.out.println("DEBUG - Created default wishlist with ID: " + wishlist.getId());
        
        return wishlist;
    }

    @Transactional
    public ResponseEntity<?> moveItemBetweenWishlists(Integer sourceWishlistId, Integer targetWishlistId, 
                                                    Integer itemId, Integer userId) {
        // Validate source wishlist
        Wishlist sourceWishlist = wishlistRepository.findByIdAndUserId(sourceWishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Danh sách yêu thích nguồn không tồn tại"));
        
        // Validate target wishlist
        Wishlist targetWishlist = wishlistRepository.findByIdAndUserId(targetWishlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Danh sách yêu thích đích không tồn tại"));
        
        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong danh sách yêu thích"));
        
        if (!item.getWishlist().getId().equals(sourceWishlistId)) {
            throw new BadRequestException("Sản phẩm không thuộc về danh sách yêu thích nguồn");
        }
        
        if (item.getVariant() == null) {
            if (wishlistItemRepository.existsByWishlistIdAndProductId(targetWishlistId, item.getProduct().getId())) {
                throw new BadRequestException("Sản phẩm đã tồn tại trong danh sách yêu thích đích");
            }
        } else {
            Optional<WishlistItem> existingItem = wishlistItemRepository
                    .findByWishlistIdAndProductIdAndVariantId(targetWishlistId, 
                                                            item.getProduct().getId(), 
                                                            item.getVariant().getId());
            if (existingItem.isPresent()) {
                throw new BadRequestException("Sản phẩm đã tồn tại trong danh sách yêu thích đích");
            }
        }
        
        item.setWishlist(targetWishlist);
        wishlistItemRepository.save(item);
        
        return ResponseEntity.ok(ResponseObject.builder()
                .status("SUCCESS")
                .message("Di chuyển sản phẩm giữa các danh sách yêu thích thành công")
                .data(convertItemToDTO(item))
                .build());
    }


    private WishlistDTO convertToDTO(Wishlist wishlist) {
        Integer itemCount = wishlistItemRepository.countItemsByWishlistId(wishlist.getId());
        
        return WishlistDTO.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUser().getId())
                .name(wishlist.getName())
                .isDefault(wishlist.getIsDefault())
                .itemCount(itemCount)
                .createdAt(wishlist.getCreatedAt())
                .updatedAt(wishlist.getUpdatedAt())
                .items(new ArrayList<>())
                .build();
    }


    private WishlistItemDTO convertItemToDTO(WishlistItem item) {
        MarketPlace product = item.getProduct();
        ProductVariant variant = item.getVariant();
        
        // Check if product is on sale
        boolean isOnSale = false;
        BigDecimal salePrice = null;
        
        if (product.getSalePrice() != null && 
            product.getSaleStartDate() != null && 
            product.getSaleEndDate() != null) {
            
            LocalDateTime now = LocalDateTime.now();
            if (now.isAfter(product.getSaleStartDate()) && now.isBefore(product.getSaleEndDate())) {
                isOnSale = true;
                salePrice = product.getSalePrice();
            }
        }
        
        return WishlistItemDTO.builder()
                .id(item.getId())
                .wishlistId(item.getWishlist().getId())
                .productId(product.getId())
                .productName(product.getProductName())
                .productImage(product.getImageUrl())
                .productPrice(product.getPrice())
                .salePrice(salePrice)
                .isOnSale(isOnSale)
                .variantId(variant != null ? variant.getId() : null)
                .variantName(variant != null ? variant.getName() : null)
                .addedAt(item.getAddedAt())
                .build();
    }


    private List<WishlistItemDTO> convertItemsToDTO(List<WishlistItem> items) {
        return items.stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());
    }
    

    private void recordProductInteraction(Integer userId, Integer productId, InteractionType type) {
        Optional<UserProductInteraction> existingInteraction = userProductInteractionRepository
                .findByUserIdAndProductIdAndType(userId, productId, type);
        
        if (existingInteraction.isPresent()) {
            UserProductInteraction interaction = existingInteraction.get();
            interaction.incrementInteractionCount();
            userProductInteractionRepository.save(interaction);
        } else {
            UserProductInteraction interaction = UserProductInteraction.builder()
                    .userId(userId)
                    .productId(productId)
                    .type(type)
                    .interactionScore(3)
                    .interactionCount(1)
                    .build();
            userProductInteractionRepository.save(interaction);
        }
    }
} 