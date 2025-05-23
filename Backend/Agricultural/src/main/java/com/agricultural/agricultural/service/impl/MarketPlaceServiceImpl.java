package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.ProductCategory;
import com.agricultural.agricultural.entity.ProductImage;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.enumeration.StockStatus;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.MarketPlaceMapper;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.repository.IProductCategoryRepository;
import com.agricultural.agricultural.repository.IProductImageRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.IMarketPlaceService;
import com.agricultural.agricultural.service.ICloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
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
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketPlaceServiceImpl implements IMarketPlaceService {
    private final IMarketPlaceRepository marketPlaceRepository;
    private final IProductCategoryRepository productCategoryRepository;
    private final UserRepository userRepository;
    private final MarketPlaceMapper marketPlaceMapper;
    private final ICloudinaryService cloudinaryService;
    private final IProductImageRepository productImageRepository;


    public MarketPlaceDTO createProduct(MarketPlaceDTO productDTO) {
        // Lấy thông tin authentication hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        log.info("Tạo sản phẩm mới cho user: {}", username);

        User user = null;
        try {
            Optional<User> userByEmail = userRepository.findByEmail(username);
            if (userByEmail.isPresent()) {
                user = userByEmail.get();
                log.info("Tìm thấy user theo email: {}", user.getId());
            } else {
                Optional<User> userByUsername = userRepository.findByUserName(username);
                if (userByUsername.isPresent()) {
                    user = userByUsername.get();
                    log.info("Tìm thấy user theo username: {}", user.getId());
                } else {
                    List<User> allUsers = userRepository.findAll();
                    
                    user = allUsers.stream()
                            .filter(u -> u.getEmail() != null && u.getEmail().equals(username))
                            .findFirst()
                            .orElse(null);
                    
                    if (user != null) {
                        log.info("Tìm thấy user qua lọc danh sách theo email: {}", user.getId());
                    } else {
                        user = allUsers.stream()
                                .filter(u -> u.getUsername() != null && u.getUsername().equals(username))
                                .findFirst()
                                .orElse(null);
                        
                        if (user != null) {
                            log.info("Tìm thấy user qua lọc danh sách theo username: {}", user.getId());
                        } else {

                            if (!allUsers.isEmpty()) {
                                user = allUsers.get(0);
                                log.warn("Không tìm thấy user với email/username '{}', sử dụng user đầu tiên ID={} cho mục đích debug", 
                                        username, user.getId());
                            } else {
                                throw new ResourceNotFoundException("Không tìm thấy người dùng với email/username: " + username);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi tìm kiếm người dùng: {}", e.getMessage(), e);
            throw new BadRequestException("Lỗi khi tìm kiếm người dùng: " + e.getMessage());
        }

        validateSaleInfo(productDTO);

        MarketPlace product = marketPlaceMapper.toEntity(productDTO);
        if (product == null) {
            throw new BadRequestException("Chuyển đổi DTO sang entity thất bại");
        }

        if (product.getImageUrl() == null) {
            product.setImageUrl("https://res.cloudinary.com/dey5xwdud/image/upload/v1618481241/default-product_ehoouh.jpg");
        }

        product.setUser(user);
        if (productDTO.getCategoryId() != null) {
            ProductCategory category = productCategoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category với id = " + productDTO.getCategoryId()));
            product.setCategory(category);
        }

        MarketPlace savedProduct = marketPlaceRepository.save(product);

        return marketPlaceMapper.toDTO(savedProduct);
    }

    @Override
    @Transactional
    public MarketPlaceDTO updateProduct(Integer id, String productName, String description, String shortDescription, 
                                       Integer quantity, BigDecimal price, BigDecimal salePrice, LocalDateTime saleStartDate, 
                                       LocalDateTime saleEndDate, Integer categoryId, String sku, Double weight, 
                                       String dimensions, MultipartFile imageFile) throws IOException {
        MarketPlace product = marketPlaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID: " + id));
        
        String oldImageUrl = product.getImageUrl();
        
        log.info("Đang cập nhật sản phẩm ID: {}, tên: {}", id, productName);
        log.info("Thông tin cũ: imageUrl={}, price={}, salePrice={}", 
                oldImageUrl, product.getPrice(), product.getSalePrice());
        
        if (productName != null) {
            product.setProductName(productName);
        }
        
        if (description != null) {
            product.setDescription(description);
        }
        
        if (shortDescription != null) {
            product.setShortDescription(shortDescription);
        }
        
        if (quantity != null) {
            product.setQuantity(quantity);
        }
        
        if (price != null) {
            product.setPrice(price);
        }
        
        if (salePrice != null && salePrice.compareTo(BigDecimal.ZERO) > 0 && saleStartDate != null && saleEndDate != null) {
            log.info("Cập nhật thông tin giảm giá: giá={}, từ={}, đến={}", 
                    salePrice, saleStartDate, saleEndDate);
            product.setSalePrice(salePrice);
            product.setSaleStartDate(saleStartDate);
            product.setSaleEndDate(saleEndDate);
        } else {
            log.info("Xóa thông tin giảm giá cho sản phẩm ID: {}", id);
            product.setSalePrice(null);
            product.setSaleStartDate(null);
            product.setSaleEndDate(null);
        }
        
        // Cập nhật danh mục
        if (categoryId != null) {
            ProductCategory category = productCategoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục ID: " + categoryId));
            product.setCategory(category);
        }
        
        if (sku != null) {
            product.setSku(sku);
        }
        
        if (weight != null) {
            product.setWeight(weight);
        }
        
        if (dimensions != null) {
            product.setDimensions(dimensions);
        }
        
        if (imageFile != null && !imageFile.isEmpty()) {
            log.info("Đang xử lý file ảnh mới: name={}, size={}, type={}", 
                    imageFile.getOriginalFilename(), imageFile.getSize(), imageFile.getContentType());
            
            try {
                // Tạo tên file
                String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
                
                // Upload file lên Cloudinary
                String fileUrl = cloudinaryService.uploadImage(imageFile, "marketplace", fileName);
                log.info("Đã upload ảnh lên Cloudinary: {}", fileUrl);
                
                // Cập nhật URL ảnh mới
                product.setImageUrl(fileUrl);
                
                // Xóa file ảnh cũ nếu có
                if (oldImageUrl != null && !oldImageUrl.isEmpty() && 
                    !oldImageUrl.equals("https://res.cloudinary.com/dey5xwdud/image/upload/v1618481241/default-product_ehoouh.jpg")) {
                    try {
                        String publicId = cloudinaryService.extractPublicIdFromUrl(oldImageUrl);
                        cloudinaryService.deleteImage(publicId);
                        log.info("Đã xóa ảnh cũ: {}", publicId);
                    } catch (Exception e) {
                        log.error("Lỗi khi xóa ảnh cũ: {}", e.getMessage());
                    }
                }
                
                // Cập nhật ảnh chính trong product_images nếu có
                try {
                    ProductImage primaryImage = productImageRepository.findByProductIdAndIsPrimaryTrue(id).orElse(null);
                    if (primaryImage != null) {
                        // Thêm timestamp vào URL để tránh cache
                        String imageUrlWithTimestamp = fileUrl;
                        if (fileUrl.contains("?")) {
                            imageUrlWithTimestamp = fileUrl + "&t=" + System.currentTimeMillis();
                        } else {
                            imageUrlWithTimestamp = fileUrl + "?t=" + System.currentTimeMillis();
                        }
                        
                        primaryImage.setImageUrl(fileUrl);
                        productImageRepository.save(primaryImage);
                        log.info("Đã cập nhật ảnh chính trong bảng product_images");
                    } else {
                        // Tạo bản ghi ảnh mới nếu chưa có
                        ProductImage newPrimaryImage = new ProductImage();
                        newPrimaryImage.setProduct(product);
                        newPrimaryImage.setImageUrl(fileUrl);
                        newPrimaryImage.setIsPrimary(true);
                        newPrimaryImage.setDisplayOrder(1);
                        newPrimaryImage.setAltText(productName);
                        newPrimaryImage.setTitle(productName);
                        productImageRepository.save(newPrimaryImage);
                        log.info("Đã tạo mới ảnh chính trong bảng product_images");
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi cập nhật ảnh chính trong product_images: {}", e.getMessage());
                }
            } catch (Exception e) {
                log.error("Lỗi khi xử lý file ảnh: {}", e.getMessage());
                throw new IOException("Lỗi khi xử lý file ảnh: " + e.getMessage());
            }
        }
        
        // Lưu sản phẩm
        MarketPlace updatedProduct = marketPlaceRepository.save(product);
        log.info("Cập nhật sản phẩm thành công, ID: {}", updatedProduct.getId());
        
        return marketPlaceMapper.toDTO(updatedProduct);
    }


    private void validateSaleInfo(MarketPlaceDTO productDTO) {
        // Nếu không có giá khuyến mãi, không cần validate thêm
        if (productDTO.getSalePrice() == null || "null".equals(String.valueOf(productDTO.getSalePrice()))) {
            System.out.println("validateSaleInfo: Bỏ qua validation vì salePrice là null");
            return;
        }
        
        // Kiểm tra giá khuyến mãi phải lớn hơn 0
        if (productDTO.getSalePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Giá khuyến mãi phải lớn hơn 0");
        }
        
        // Giá khuyến mãi phải nhỏ hơn giá gốc
        if (productDTO.getPrice() != null && productDTO.getSalePrice().compareTo(productDTO.getPrice()) >= 0) {
            throw new BadRequestException("Giá khuyến mãi phải nhỏ hơn giá gốc");
        }
        
        // Ngày khuyến mãi phải hợp lệ nếu có cung cấp
        if (productDTO.getSaleStartDate() != null && productDTO.getSaleEndDate() != null) {
            if (productDTO.getSaleEndDate().isBefore(productDTO.getSaleStartDate())) {
                throw new BadRequestException("Ngày kết thúc khuyến mãi phải sau ngày bắt đầu");
            }
        }
        
        System.out.println("validateSaleInfo: Đã qua tất cả kiểm tra, thông tin khuyến mãi hợp lệ!");
    }

    @Override
    @Transactional
    public MarketPlaceDTO getProduct(Integer id) {
        // Tìm sản phẩm trong repository
        MarketPlace product = marketPlaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        
        // Cập nhật trạng thái tồn kho mỗi khi lấy thông tin sản phẩm
        updateStockStatus(product);
        
        // Lưu lại nếu có thay đổi về trạng thái
        product = marketPlaceRepository.save(product);
        
        // Chuyển đổi thành DTO và trả về
        return marketPlaceMapper.toDTO(product);
    }

    @Override
    @Transactional
    public Page<MarketPlaceDTO> getAllProducts(Pageable pageable) {
        // Lấy tất cả sản phẩm từ repository
        Page<MarketPlace> products = marketPlaceRepository.findAll(pageable);
        
        List<MarketPlace> updatedProducts = new ArrayList<>();
        for (MarketPlace product : products.getContent()) {
            updateStockStatus(product);
            updatedProducts.add(marketPlaceRepository.save(product));
        }
        
        // Tạo page mới với các sản phẩm đã cập nhật
        return products.map(marketPlaceMapper::toDTO);
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
            String sortBy,
            Pageable pageable) {
        
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa");
        }
        
        if (sortBy != null && !sortBy.isEmpty() && !sortBy.equals("newest")) {
            System.out.println("Đang áp dụng sắp xếp: " + sortBy);

            Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt");
            
            switch (sortBy) {
                case "price-low":
                    sort = Sort.by(Sort.Direction.ASC, "price").and(sort);
                    break;
                case "price-high":
                    sort = Sort.by(Sort.Direction.DESC, "price").and(sort);
                    break;
                case "name-asc":
                    sort = Sort.by(Sort.Direction.ASC, "productName").and(sort);
                    break;
                case "name-desc":
                    sort = Sort.by(Sort.Direction.DESC, "productName").and(sort);
                    break;
                case "rating":
                    sort = Sort.by(Sort.Direction.DESC, "averageRating").and(sort);
                    break;
                default:
                    // Mặc định là newest, đã có Sort.by("updatedAt")
                    break;
            }
            
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
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
    public MarketPlaceDTO updateProduct(Integer id, MarketPlaceDTO productDTO) {
        try {
            // Tìm sản phẩm cần cập nhật
            MarketPlace product = marketPlaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

            // Xử lý dữ liệu đặc biệt trước khi tiến hành cập nhật
            processDateTimeFields(productDTO);
            
            // Log thông tin trước khi cập nhật
            System.out.println("===== THÔNG TIN SẢN PHẨM TRƯỚC KHI CẬP NHẬT (WITH IMAGE) =====");
            System.out.println("ID: " + product.getId());
            System.out.println("Product Name: " + product.getProductName());
            System.out.println("Quantity: " + product.getQuantity());
            System.out.println("Stock Status: " + product.getStockStatus());
            System.out.println("salePrice: " + product.getSalePrice());
            System.out.println("saleStartDate: " + product.getSaleStartDate());
            System.out.println("saleEndDate: " + product.getSaleEndDate());
            System.out.println("isOnSale: " + product.isOnSale());
            
            // Log thông tin DTO được gửi lên
            System.out.println("===== THÔNG TIN DTO ĐƯỢC GỬI LÊN =====");
            System.out.println("Product Name: " + productDTO.getProductName());
            System.out.println("Giá trị salePrice gửi lên: " + productDTO.getSalePrice());
            System.out.println("Giá trị saleStartDate gửi lên: " + productDTO.getSaleStartDate());
            System.out.println("Giá trị saleEndDate gửi lên: " + productDTO.getSaleEndDate());
            
            // Kiểm tra xem có bật/tắt chế độ giảm giá hay không
            boolean enableSale = productDTO.getSalePrice() != null && productDTO.getSalePrice().compareTo(BigDecimal.ZERO) > 0;
            System.out.println("enableSale: " + enableSale + " (dựa vào salePrice=" + productDTO.getSalePrice() + ")");

            // Lưu lại thông tin của sản phẩm
            if (productDTO.getProductName() != null) {
                product.setProductName(productDTO.getProductName());
            }
            
            if (productDTO.getDescription() != null) {
                product.setDescription(productDTO.getDescription());
            }
            
            if (productDTO.getShortDescription() != null) {
                product.setShortDescription(productDTO.getShortDescription());
            }
            
                product.setQuantity(productDTO.getQuantity());

            
            if (productDTO.getPrice() != null) {
                product.setPrice(productDTO.getPrice());
            }
            
            if (productDTO.getSku() != null) {
                product.setSku(productDTO.getSku());
            }
            
            if (productDTO.getCategoryId() != null) {
                ProductCategory category = productCategoryRepository.findById(productDTO.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + productDTO.getCategoryId()));
                product.setCategory(category);
            }
            
            if (productDTO.getWeight() != null) {
                product.setWeight(productDTO.getWeight());
            }
            
            if (productDTO.getDimensions() != null) {
                product.setDimensions(productDTO.getDimensions());
            }
            
            if (productDTO.getImageUrl() != null) {
                product.setImageUrl(productDTO.getImageUrl());
            }
            
            // XỬ LÝ THÔNG TIN KHUYẾN MÃI
            if (enableSale) {
                // Nếu bật chế độ giảm giá và có thông tin giá khuyến mãi
                product.setSalePrice(productDTO.getSalePrice());
                System.out.println("Đã cập nhật salePrice: " + product.getSalePrice());
                
                // Xử lý các ngày bắt đầu/kết thúc giảm giá
                if (productDTO.getSaleStartDate() != null) {
                    product.setSaleStartDate(productDTO.getSaleStartDate());
                    System.out.println("Đã cập nhật saleStartDate: " + product.getSaleStartDate());
                } else if (product.getSaleStartDate() == null) {
                    // Nếu không có ngày bắt đầu thì đặt mặc định là ngày hiện tại
                    LocalDateTime now = LocalDateTime.now();
                    product.setSaleStartDate(now);
                    System.out.println("Đã đặt saleStartDate mặc định: " + now);
                }
                
                if (productDTO.getSaleEndDate() != null) {
                    product.setSaleEndDate(productDTO.getSaleEndDate());
                    System.out.println("Đã cập nhật saleEndDate: " + product.getSaleEndDate());
                } else if (product.getSaleEndDate() == null) {
                    // Nếu không có ngày kết thúc thì mặc định là sau 1 tháng
                    LocalDateTime endDate = LocalDateTime.now().plusMonths(1);
                    product.setSaleEndDate(endDate);
                    System.out.println("Đã đặt saleEndDate mặc định: " + endDate);
                }
            } else {
                // Nếu tắt chế độ giảm giá, xóa tất cả thông tin liên quan
                product.setSalePrice(null);
                product.setSaleStartDate(null);
                product.setSaleEndDate(null);
                System.out.println("Đã xóa tất cả thông tin giảm giá");
            }
            
            // Cập nhật trạng thái tồn kho dựa trên số lượng
            updateStockStatus(product);
            
            // Lưu sản phẩm đã cập nhật vào cơ sở dữ liệu
            MarketPlace updatedProduct = marketPlaceRepository.save(product);
            
            // Kiểm tra sau khi lưu
            System.out.println("===== THÔNG TIN SẢN PHẨM SAU KHI CẬP NHẬT (WITH IMAGE) =====");
            System.out.println("ID: " + updatedProduct.getId());
            System.out.println("Product Name: " + updatedProduct.getProductName());
            System.out.println("Quantity: " + updatedProduct.getQuantity());
            System.out.println("Stock Status: " + updatedProduct.getStockStatus());
            System.out.println("salePrice: " + updatedProduct.getSalePrice());
            System.out.println("saleStartDate: " + updatedProduct.getSaleStartDate());
            System.out.println("saleEndDate: " + updatedProduct.getSaleEndDate());
            System.out.println("isOnSale: " + updatedProduct.isOnSale());
            
            // Chuyển đổi entity thành DTO và trả về
            return marketPlaceMapper.toDTO(updatedProduct);
        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi cập nhật sản phẩm: " + e.getMessage());
        }
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

    private int convertMonthNameToNumber(String monthName) {
        switch (monthName.toLowerCase()) {
            case "jan": return 1;
            case "feb": return 2;
            case "mar": return 3;
            case "apr": return 4;
            case "may": return 5;
            case "jun": return 6;
            case "jul": return 7;
            case "aug": return 8;
            case "sep": return 9;
            case "oct": return 10;
            case "nov": return 11;
            case "dec": return 12;
            default: throw new BadRequestException("Tên tháng không hợp lệ: " + monthName);
        }
    }

    private void updateStockStatus(MarketPlace product) {
        if (product.getQuantity() <= 0) {
            product.setStockStatus(StockStatus.OUT_OF_STOCK);
            System.out.println("Cập nhật trạng thái: OUT_OF_STOCK cho sản phẩm " + product.getId() + " vì quantity = " + product.getQuantity());
        } else if (product.getQuantity() <= 10) {
            product.setStockStatus(StockStatus.LOW_STOCK);
            System.out.println("Cập nhật trạng thái: LOW_STOCK cho sản phẩm " + product.getId() + " vì quantity = " + product.getQuantity());
        } else {
            product.setStockStatus(StockStatus.IN_STOCK);
            System.out.println("Cập nhật trạng thái: IN_STOCK cho sản phẩm " + product.getId() + " vì quantity = " + product.getQuantity());
        }
        
        System.out.println("Cập nhật trạng thái tồn kho: " + product.getStockStatus() + " cho sản phẩm: " + product.getId() + " - " + product.getProductName());
    }

    @Override
    public List<MarketPlaceDTO> refreshAllStockStatus() {
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        
        System.out.println("======== BẮT ĐẦU CẬP NHẬT TRẠNG THÁI TỒN KHO VÀ GIẢM GIÁ ========");
        System.out.println("Tổng số sản phẩm cần cập nhật: " + allProducts.size());
        
        for (MarketPlace product : allProducts) {
            StockStatus oldStatus = product.getStockStatus();
            Integer quantity = product.getQuantity();
            
            System.out.println("\n----- ĐANG XỬ LÝ SẢN PHẨM #" + product.getId() + ": " + product.getProductName() + " -----");
            
            // Cập nhật trạng thái tồn kho dựa trên số lượng
            if (quantity <= 0) {
                product.setStockStatus(StockStatus.OUT_OF_STOCK);
            } else if (quantity <= 10) {
                product.setStockStatus(StockStatus.LOW_STOCK);
            } else {
                product.setStockStatus(StockStatus.IN_STOCK);
            }
            
            if (oldStatus != product.getStockStatus()) {
                System.out.println("Đã cập nhật stockStatus từ " + oldStatus + " thành " + product.getStockStatus());
            } else {
                System.out.println("Stockstatus không thay đổi: " + oldStatus);
            }
            
            boolean isOnSale = product.isOnSale();
            System.out.println("Trạng thái giảm giá: " + (isOnSale ? "ĐANG GIẢM GIÁ" : "KHÔNG GIẢM GIÁ"));
            System.out.println("Chi tiết: salePrice=" + product.getSalePrice() + 
                                ", saleStartDate=" + product.getSaleStartDate() + 
                                ", saleEndDate=" + product.getSaleEndDate());
        }
        
        // Lưu tất cả các thay đổi
        List<MarketPlace> updatedProducts = marketPlaceRepository.saveAll(allProducts);
        System.out.println("Đã lưu " + updatedProducts.size() + " sản phẩm sau khi cập nhật");
        
        // Convert sang DTO và trả về
        return updatedProducts.stream()
                              .map(marketPlaceMapper::toDTO)
                              .collect(Collectors.toList());
    }

    @Override
    public List<MarketPlaceDTO> refreshAllProducts() {
        System.out.println("===== BẮT ĐẦU LÀM MỚI DỮ LIỆU CỦA TẤT CẢ SẢN PHẨM =====");
        
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        System.out.println("Tổng số sản phẩm cần làm mới: " + allProducts.size());
        
        List<MarketPlace> updatedProducts = new ArrayList<>();
        
        for (MarketPlace product : allProducts) {
            boolean needsUpdate = false;
            
            StockStatus originalStatus = product.getStockStatus();
            
            StockStatus newStatus;
            if (product.getQuantity() <= 0) {
                newStatus = StockStatus.OUT_OF_STOCK;
            } else if (product.getQuantity() <= 10) {
                newStatus = StockStatus.LOW_STOCK;
            } else {
                newStatus = StockStatus.IN_STOCK;
            }
            
            if (originalStatus != newStatus) {
                System.out.println("Sản phẩm ID " + product.getId() + " - " + product.getProductName() + 
                        ": Cập nhật trạng thái từ " + originalStatus + " thành " + newStatus);
                product.setStockStatus(newStatus);
                needsUpdate = true;
            }
            
            boolean originalOnSale = product.isOnSale();  // Gọi phương thức để kiểm tra
            
            if (needsUpdate) {
                updatedProducts.add(product);
            }
        }
        
        if (!updatedProducts.isEmpty()) {
            System.out.println("Lưu " + updatedProducts.size() + " sản phẩm đã cập nhật vào database");
            marketPlaceRepository.saveAll(updatedProducts);
        } else {
            System.out.println("Không có sản phẩm nào cần cập nhật");
        }
        
        List<MarketPlaceDTO> productDTOs = allProducts.stream()
                .map(marketPlaceMapper::toDTO)
                .collect(Collectors.toList());
        
        System.out.println("===== HOÀN THÀNH LÀM MỚI DỮ LIỆU SẢN PHẨM =====");
        return productDTOs;
    }

    private void processDateTimeFields(MarketPlaceDTO productDTO) {
        // Xử lý salePrice
        if (productDTO.getSalePrice() != null) {
            String salePriceStr = productDTO.getSalePrice().toString();
            if ("null".equals(salePriceStr) || "undefined".equals(salePriceStr) || "0".equals(salePriceStr)) {
                System.out.println("Service: Phát hiện salePrice là chuỗi '" + salePriceStr + "', chuyển thành null thực sự");
                productDTO.setSalePrice(null);
            }
        }
        
        if (productDTO.getSaleStartDate() != null) {
            String dateStr = productDTO.getSaleStartDate().toString();
            if (dateStr.contains("null") || dateStr.contains("undefined")) {
                System.out.println("Service: Phát hiện saleStartDate chứa 'null' hoặc 'undefined', chuyển thành null thực sự");
                productDTO.setSaleStartDate(null);
            } else {
                try {
                    System.out.println("Service: Xử lý saleStartDate: " + dateStr);
                    
                    // Thử chuyển đổi từ định dạng yyyy-MM-dd'T'HH:mm
                    if (dateStr.matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}.*")) {
                        try {
                            // Nếu chỉ có yyyy-MM-dd'T'HH:mm
                            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
                            LocalDateTime parsedDate = LocalDateTime.parse(dateStr.substring(0, 16), formatter);
                            productDTO.setSaleStartDate(parsedDate);
                            System.out.println("Service: Đã chuyển đổi saleStartDate thành công từ yyyy-MM-dd'T'HH:mm: " + parsedDate);
                        } catch (Exception e) {
                            // Nếu có vùng thời gian, thử ISO
                            try {
                                java.time.Instant instant = java.time.Instant.parse(dateStr);
                                LocalDateTime convertedDate = LocalDateTime.ofInstant(
                                    instant, ZoneId.systemDefault());
                                productDTO.setSaleStartDate(convertedDate);
                                System.out.println("Service: Đã chuyển đổi saleStartDate thành công từ ISO: " + convertedDate);
                            } catch (Exception ex) {
                                System.err.println("Service: Lỗi khi chuyển đổi saleStartDate: " + ex.getMessage());
                                productDTO.setSaleStartDate(null);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Service: Lỗi khi xử lý saleStartDate: " + e.getMessage());
                    productDTO.setSaleStartDate(null);
                }
            }
        }
        
        // Xử lý saleEndDate
        if (productDTO.getSaleEndDate() != null) {
            String dateStr = productDTO.getSaleEndDate().toString();
            if (dateStr.contains("null") || dateStr.contains("undefined")) {
                System.out.println("Service: Phát hiện saleEndDate chứa 'null' hoặc 'undefined', chuyển thành null thực sự");
                productDTO.setSaleEndDate(null);
            } else {
                try {
                    System.out.println("Service: Xử lý saleEndDate: " + dateStr);
                    
                    if (dateStr.matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}.*")) {
                        try {
                            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
                            LocalDateTime parsedDate = LocalDateTime.parse(dateStr.substring(0, 16), formatter);
                            productDTO.setSaleEndDate(parsedDate);
                            System.out.println("Service: Đã chuyển đổi saleEndDate thành công từ yyyy-MM-dd'T'HH:mm: " + parsedDate);
                        } catch (Exception e) {
                            try {
                                java.time.Instant instant = java.time.Instant.parse(dateStr);
                                LocalDateTime convertedDate = LocalDateTime.ofInstant(
                                    instant, ZoneId.systemDefault());
                                productDTO.setSaleEndDate(convertedDate);
                                System.out.println("Service: Đã chuyển đổi saleEndDate thành công từ ISO: " + convertedDate);
                            } catch (Exception ex) {
                                System.err.println("Service: Lỗi khi chuyển đổi saleEndDate: " + ex.getMessage());
                                productDTO.setSaleEndDate(null);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Service: Lỗi khi xử lý saleEndDate: " + e.getMessage());
                    productDTO.setSaleEndDate(null);
                }
            }
        }
        
        productDTO.setImages(null);
    }

    @Override
    public MarketPlaceDTO updateProductWithImage(Integer id, MarketPlaceDTO productDTO) throws IOException {
        try {
            MarketPlace product = marketPlaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

            processDateTimeFields(productDTO);
            
            // Log thông tin trước khi cập nhật
            log.info("===== THÔNG TIN SẢN PHẨM TRƯỚC KHI CẬP NHẬT (WITH IMAGE) =====");
            log.info("ID: {}", product.getId());
            log.info("Product Name: {}", product.getProductName());
            log.info("Quantity: {}", product.getQuantity());
            log.info("Stock Status: {}", product.getStockStatus());
            log.info("salePrice: {}", product.getSalePrice());
            log.info("saleStartDate: {}", product.getSaleStartDate());
            log.info("saleEndDate: {}", product.getSaleEndDate());
            log.info("isOnSale: {}", product.isOnSale());
            
            // Log thông tin DTO được gửi lên
            log.info("===== THÔNG TIN DTO ĐƯỢC GỬI LÊN =====");
            log.info("Product Name: {}", productDTO.getProductName());
            log.info("Giá trị salePrice gửi lên: {}", productDTO.getSalePrice());
            log.info("Giá trị saleStartDate gửi lên: {}", productDTO.getSaleStartDate());
            log.info("Giá trị saleEndDate gửi lên: {}", productDTO.getSaleEndDate());
            
            // Kiểm tra xem có bật/tắt chế độ giảm giá hay không
            boolean enableSale = productDTO.getSalePrice() != null && productDTO.getSalePrice().compareTo(BigDecimal.ZERO) > 0;
            log.info("enableSale: {} (dựa vào salePrice={})", enableSale, productDTO.getSalePrice());

            // Lưu lại thông tin của sản phẩm
            if (productDTO.getProductName() != null) {
                product.setProductName(productDTO.getProductName());
            }
            
            if (productDTO.getDescription() != null) {
                product.setDescription(productDTO.getDescription());
            }
            
            if (productDTO.getShortDescription() != null) {
                product.setShortDescription(productDTO.getShortDescription());
            }
            
                product.setQuantity(productDTO.getQuantity());

            
            if (productDTO.getPrice() != null) {
                product.setPrice(productDTO.getPrice());
            }
            
            if (productDTO.getSku() != null) {
                product.setSku(productDTO.getSku());
            }
            
            if (productDTO.getCategoryId() != null) {
                ProductCategory category = productCategoryRepository.findById(productDTO.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + productDTO.getCategoryId()));
                product.setCategory(category);
            }
            
            if (productDTO.getWeight() != null) {
                product.setWeight(productDTO.getWeight());
            }
            
            if (productDTO.getDimensions() != null) {
                product.setDimensions(productDTO.getDimensions());
            }
            
            if (productDTO.getImageUrl() != null) {
                product.setImageUrl(productDTO.getImageUrl());
            }
            
            // XỬ LÝ THÔNG TIN KHUYẾN MÃI
            if (enableSale) {
                // Nếu bật chế độ giảm giá và có thông tin giá khuyến mãi
                product.setSalePrice(productDTO.getSalePrice());
                log.info("Đã cập nhật salePrice: {}", product.getSalePrice());
                
                // Xử lý các ngày bắt đầu/kết thúc giảm giá
                if (productDTO.getSaleStartDate() != null) {
                    product.setSaleStartDate(productDTO.getSaleStartDate());
                    log.info("Đã cập nhật saleStartDate: {}", product.getSaleStartDate());
                } else if (product.getSaleStartDate() == null) {
                    LocalDateTime now = LocalDateTime.now();
                    product.setSaleStartDate(now);
                    log.info("Đã đặt saleStartDate mặc định: {}", now);
                }
                
                if (productDTO.getSaleEndDate() != null) {
                    product.setSaleEndDate(productDTO.getSaleEndDate());
                    log.info("Đã cập nhật saleEndDate: {}", product.getSaleEndDate());
                } else if (product.getSaleEndDate() == null) {
                    // Nếu không có ngày kết thúc thì mặc định là sau 1 tháng
                    LocalDateTime endDate = LocalDateTime.now().plusMonths(1);
                    product.setSaleEndDate(endDate);
                    log.info("Đã đặt saleEndDate mặc định: {}", endDate);
                }
            } else {
                product.setSalePrice(null);
                product.setSaleStartDate(null);
                product.setSaleEndDate(null);
                log.info("Đã xóa tất cả thông tin giảm giá");
            }
            
            // Cập nhật trạng thái tồn kho dựa trên số lượng
            updateStockStatus(product);
            
            // Lưu sản phẩm đã cập nhật vào cơ sở dữ liệu
            MarketPlace updatedProduct = marketPlaceRepository.save(product);
            
            // Kiểm tra sau khi lưu
            log.info("===== THÔNG TIN SẢN PHẨM SAU KHI CẬP NHẬT (WITH IMAGE) =====");
            log.info("ID: {}", updatedProduct.getId());
            log.info("Product Name: {}", updatedProduct.getProductName());
            log.info("Quantity: {}", updatedProduct.getQuantity());
            log.info("Stock Status: {}", updatedProduct.getStockStatus());
            log.info("salePrice: {}", updatedProduct.getSalePrice());
            log.info("saleStartDate: {}", updatedProduct.getSaleStartDate());
            log.info("saleEndDate: {}", updatedProduct.getSaleEndDate());
            log.info("isOnSale: {}", updatedProduct.isOnSale());
            
            // Chuyển đổi entity thành DTO và trả về
            return marketPlaceMapper.toDTO(updatedProduct);
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật sản phẩm: {}", e.getMessage());
            throw new BadRequestException("Lỗi khi cập nhật sản phẩm: " + e.getMessage());
        }
    }

} 