package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.MarketPlaceMapper;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.IMarketPlaceService;
import com.agricultural.agricultural.service.ICloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketPlaceServiceImpl implements IMarketPlaceService {
    private final IMarketPlaceRepository marketPlaceRepository;
    private final UserRepository userRepository;
    private final MarketPlaceMapper marketPlaceMapper;
    private final ICloudinaryService cloudinaryService;


    @Override
    public MarketPlaceDTO createProduct(MarketPlaceDTO productDTO) {
        // Lấy thông tin authentication hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User user;
        try {
            // Thử tìm theo email thay vì username
            Optional<User> userByEmail = userRepository.findByEmail(username);
            if (userByEmail.isPresent()) {
                user = userByEmail.get();
            } else {
                // Nếu không tìm thấy bằng email, thử tìm theo username và lấy user đầu tiên
                List<User> allUsers = userRepository.findAll();
                user = allUsers.stream()
                        .filter(u -> u.getUsername().equals(username))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
            }
        } catch (Exception e) {
            // Xử lý nếu có lỗi khác
            log.error("Lỗi khi tìm kiếm người dùng: {}", e.getMessage());
            throw new BadRequestException("Lỗi khi tìm kiếm người dùng: " + e.getMessage());
        }
        
        // Validate thông tin khuyến mãi
        validateSaleInfo(productDTO);

        MarketPlace product = marketPlaceMapper.toEntity(productDTO);
        if (product == null) {
            throw new BadRequestException("Chuyển đổi DTO sang entity thất bại");
        }

        // Thêm giá trị mặc định cho image_url nếu nó null
        if (product.getImageUrl() == null) {
            product.setImageUrl("https://res.cloudinary.com/dey5xwdud/image/upload/v1618481241/default-product_ehoouh.jpg");
        }

        product.setUser(user);
        MarketPlace savedProduct = marketPlaceRepository.save(product);

        return marketPlaceMapper.toDTO(savedProduct);
    }

    public MarketPlaceDTO updateProduct(Integer id, MarketPlaceDTO productDTO) {
        // Lấy thông tin người dùng hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Người dùng chưa đăng nhập hoặc không hợp lệ.");
        }
        String currentProduct = authentication.getName();  // Tên người dùng hiện tại

        // Lấy sản phẩm từ cơ sở dữ liệu
        MarketPlace product = marketPlaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        // Kiểm tra quyền sở hữu sản phẩm
        if (!product.getUser().getUsername().equals(currentProduct)) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa sản phẩm này!");
        }

        // Kiểm tra giá trị của price và quantity trong productDTO
        if (productDTO.getPrice() != null && productDTO.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Giá sản phẩm phải lớn hơn 0");
        }

        if (productDTO.getQuantity() < 0) {
            throw new BadRequestException("Số lượng sản phẩm không được âm");
        }

        // Validate thông tin khuyến mãi
        validateSaleInfo(productDTO);

        // Cập nhật entity từ DTO
        marketPlaceMapper.updateEntityFromDTO(productDTO, product);
        
        // Đảm bảo image_url không null sau khi cập nhật
        if (product.getImageUrl() == null) {
            product.setImageUrl("https://res.cloudinary.com/dey5xwdud/image/upload/v1618481241/default-product_ehoouh.jpg");
        }

        // Lưu sản phẩm đã được cập nhật
        MarketPlace updatedProduct = marketPlaceRepository.save(product);

        // Trả về DTO của sản phẩm đã cập nhật
        return marketPlaceMapper.toDTO(updatedProduct);
    }

    /**
     * Kiểm tra tính hợp lệ của thông tin khuyến mãi
     */
    private void validateSaleInfo(MarketPlaceDTO productDTO) {
        // Nếu có thông tin salePrice, phải có đầy đủ thông tin ngày bắt đầu và kết thúc
        if (productDTO.getSalePrice() != null) {
            // Kiểm tra giá khuyến mãi phải hợp lệ
            if (productDTO.getSalePrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Giá khuyến mãi phải lớn hơn 0");
            }
            
            // Nếu có giá khuyến mãi thì phải có ngày bắt đầu và kết thúc
            if (productDTO.getSaleStartDate() == null) {
                throw new BadRequestException("Vui lòng cung cấp ngày bắt đầu khuyến mãi");
            }
            
            if (productDTO.getSaleEndDate() == null) {
                throw new BadRequestException("Vui lòng cung cấp ngày kết thúc khuyến mãi");
            }
            
            // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
            if (productDTO.getSaleStartDate().isAfter(productDTO.getSaleEndDate())) {
                throw new BadRequestException("Ngày bắt đầu khuyến mãi phải trước ngày kết thúc");
            }
            
            // Kiểm tra giá khuyến mãi phải nhỏ hơn giá gốc
            if (productDTO.getSalePrice().compareTo(productDTO.getPrice()) >= 0) {
                throw new BadRequestException("Giá khuyến mãi phải nhỏ hơn giá gốc");
            }
        }
    }

    @Override
    @Transactional
    public MarketPlaceDTO getProduct(Integer id) {
        MarketPlace product = marketPlaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        return marketPlaceMapper.toDTO(product);
    }

    @Override
    @Transactional
    public Page<MarketPlaceDTO> getAllProducts(Pageable pageable) {
        return marketPlaceRepository.findAll(pageable)
                .map(marketPlaceMapper::toDTO);
    }

    @Override
    @Transactional
    public Page<MarketPlaceDTO> getProductsByUser(Integer userId, Pageable pageable) {
        if (userId == null) {
            throw new BadRequestException("User ID không được để trống");
        }
        
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }
        
        return marketPlaceRepository.findByUserId(userId, pageable)
                .map(marketPlaceMapper::toDTO);
    }

    @Override
    @Transactional
    public Page<MarketPlaceDTO> searchProducts(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BadRequestException("Từ khóa tìm kiếm không được để trống");
        }
        return marketPlaceRepository.searchByProductName(keyword, pageable)
                .map(marketPlaceMapper::toDTO);
    }

    @Override
    @Transactional
    public Page<MarketPlaceDTO> getAvailableProducts(Pageable pageable) {
        return marketPlaceRepository.findAvailableProducts(pageable)
                .map(marketPlaceMapper::toDTO);
    }

    @Override
    @Transactional
    public Page<MarketPlaceDTO> getProductsByCategory(Integer categoryId, Pageable pageable) {
        if (categoryId == null) {
            throw new BadRequestException("Category ID không được để trống");
        }
        return marketPlaceRepository.findByCategoryId(categoryId, pageable)
                .map(marketPlaceMapper::toDTO);
    }

    @Override
    @Transactional
    public Page<MarketPlaceDTO> getOnSaleProducts(Pageable pageable) {
        return marketPlaceRepository.findOnSaleProducts(LocalDateTime.now(), pageable)
                .map(marketPlaceMapper::toDTO);
    }

    @Override
    @Transactional
    public Page<MarketPlaceDTO> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        if (minPrice == null) {
            minPrice = BigDecimal.ZERO;
        }
        
        if (maxPrice == null) {
            maxPrice = new BigDecimal("999999999.99"); // Giá tối đa rất lớn
        }
        
        if (minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa");
        }
        
        return marketPlaceRepository.findByPriceRange(minPrice, maxPrice, LocalDateTime.now(), pageable)
                .map(marketPlaceMapper::toDTO);
    }
    
    @Override
    @Transactional
    public Page<MarketPlaceDTO> getProductsByMinimumRating(BigDecimal minRating, Pageable pageable) {
        if (minRating == null) {
            minRating = BigDecimal.ZERO;
        }
        
        if (minRating.compareTo(BigDecimal.ZERO) < 0 || minRating.compareTo(new BigDecimal("5.0")) > 0) {
            throw new BadRequestException("Xếp hạng tối thiểu phải nằm trong khoảng từ 0 đến 5");
        }
        
        return marketPlaceRepository.findByMinimumRating(minRating, pageable)
                .map(marketPlaceMapper::toDTO);
    }
    
    @Override
    @Transactional
    public Page<MarketPlaceDTO> getPopularProducts(Pageable pageable) {
        return marketPlaceRepository.findPopularProducts(pageable)
                .map(marketPlaceMapper::toDTO);
    }
    
    @Override
    @Transactional
    public Page<MarketPlaceDTO> getRecentlyUpdatedProducts(Pageable pageable) {
        return marketPlaceRepository.findRecentlyUpdatedProducts(pageable)
                .map(marketPlaceMapper::toDTO);
    }
    
    @Override
    @Transactional
    public Page<MarketPlaceDTO> advancedSearch(
            Integer categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String keyword,
            boolean onSaleOnly,
            Pageable pageable) {
        
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa");
        }
        
        return marketPlaceRepository.advancedSearch(
                categoryId,
                minPrice,
                maxPrice,
                keyword,
                onSaleOnly,
                LocalDateTime.now(),
                pageable
        ).map(marketPlaceMapper::toDTO);
    }

    @Override
    public MarketPlaceDTO createProductWithImage(
            String productName,
            String description,
            String shortDescription,
            int quantity,
            BigDecimal price,
            BigDecimal salePrice,
            LocalDateTime saleStartDate,
            LocalDateTime saleEndDate,
            Integer categoryId,
            String sku,
            Double weight,
            String dimensions,
            MultipartFile image) throws IOException {
        
        // Tạo DTO từ dữ liệu form
        MarketPlaceDTO productDTO = MarketPlaceDTO.builder()
                .productName(productName)
                .description(description)
                .shortDescription(shortDescription)
                .quantity(quantity)
                .price(price)
                .salePrice(salePrice)
                .saleStartDate(saleStartDate)
                .saleEndDate(saleEndDate)
                .categoryId(categoryId)
                .sku(sku)
                .weight(weight)
                .dimensions(dimensions)
                .build();
        
        // Upload ảnh lên Cloudinary nếu có
        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image, "marketplace-products");
            productDTO.setImageUrl(imageUrl);
        }
        
        // Gọi phương thức createProduct để tạo sản phẩm
        return createProduct(productDTO);
    }
    
    @Override
    public MarketPlaceDTO updateProductWithImage(
            Integer id,
            String productName,
            String description,
            String shortDescription,
            Integer quantity,
            BigDecimal price,
            BigDecimal salePrice,
            LocalDateTime saleStartDate,
            LocalDateTime saleEndDate,
            Integer categoryId,
            String sku,
            Double weight,
            String dimensions,
            MultipartFile image) throws IOException {
        
        // Lấy thông tin sản phẩm hiện tại
        MarketPlaceDTO existingProduct = getProduct(id);
        
        // Tạo DTO mới với các giá trị được cập nhật
        MarketPlaceDTO productDTO = MarketPlaceDTO.builder()
                .id(id)
                .productName(productName != null ? productName : existingProduct.getProductName())
                .description(description != null ? description : existingProduct.getDescription())
                .shortDescription(shortDescription != null ? shortDescription : existingProduct.getShortDescription())
                .quantity(quantity != null ? quantity : existingProduct.getQuantity())
                .price(price != null ? price : existingProduct.getPrice())
                .salePrice(salePrice != null ? salePrice : existingProduct.getSalePrice())
                .saleStartDate(saleStartDate != null ? saleStartDate : existingProduct.getSaleStartDate())
                .saleEndDate(saleEndDate != null ? saleEndDate : existingProduct.getSaleEndDate())
                .categoryId(categoryId != null ? categoryId : existingProduct.getCategoryId())
                .sku(sku != null ? sku : existingProduct.getSku())
                .weight(weight != null ? weight : existingProduct.getWeight())
                .dimensions(dimensions != null ? dimensions : existingProduct.getDimensions())
                .imageUrl(existingProduct.getImageUrl()) // Giữ lại URL ảnh hiện tại
                .build();
        
        // Upload ảnh mới nếu có
        if (image != null && !image.isEmpty()) {
            // Xóa ảnh cũ nếu có
            if (existingProduct.getImageUrl() != null && !existingProduct.getImageUrl().isEmpty() 
                    && !existingProduct.getImageUrl().contains("default-product_ehoouh.jpg")) {
                try {
                    String publicId = cloudinaryService.extractPublicIdFromUrl(existingProduct.getImageUrl());
                    cloudinaryService.deleteImage(publicId);
                } catch (Exception e) {
                    // Bỏ qua lỗi khi xóa ảnh cũ
                    log.warn("Không thể xóa ảnh cũ: {}", e.getMessage());
                }
            }
            
            // Upload ảnh mới
            String imageUrl = cloudinaryService.uploadImage(image, "marketplace-products");
            productDTO.setImageUrl(imageUrl);
        }
        
        // Gọi phương thức updateProduct để cập nhật sản phẩm
        return updateProduct(id, productDTO);
    }

    @Override
    @Transactional
    public void deleteProduct(Integer id) {
        // Tìm sản phẩm để lấy thông tin ảnh
        MarketPlace product = marketPlaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        
        // Lấy URL ảnh
        String imageUrl = product.getImageUrl();
        
        // Xóa sản phẩm từ database
        marketPlaceRepository.deleteById(id);
        
        // Xóa ảnh từ Cloudinary nếu có và không phải ảnh mặc định
        if (imageUrl != null && !imageUrl.isEmpty() && !imageUrl.contains("default-product_ehoouh.jpg")) {
            try {
                String publicId = cloudinaryService.extractPublicIdFromUrl(imageUrl);
                cloudinaryService.deleteImage(publicId);
            } catch (Exception e) {
                // Bỏ qua lỗi khi xóa ảnh
                log.warn("Không thể xóa ảnh: {}", e.getMessage());
            }
        }
    }

} 