package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.ProductCategory;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.enumeration.StockStatus;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.MarketPlaceMapper;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.repository.IProductCategoryRepository;
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
        // Phan Duc them
        if (productDTO.getCategoryId() != null) {
            ProductCategory category = productCategoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category với id = " + productDTO.getCategoryId()));
            product.setCategory(category);
        }

        //
        MarketPlace savedProduct = marketPlaceRepository.save(product);

        return marketPlaceMapper.toDTO(savedProduct);
    }

    @Override
    public MarketPlaceDTO updateProduct(Integer id, MarketPlaceDTO productDTO) {
        // Tìm sản phẩm cần cập nhật
        MarketPlace product = marketPlaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        
        // Xử lý dữ liệu đặc biệt trước khi tiến hành cập nhật
        processDateTimeFields(productDTO);
        
        // Log thông tin trước khi cập nhật
        System.out.println("===== THÔNG TIN SẢN PHẨM TRƯỚC KHI CẬP NHẬT =====");
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
        System.out.println("ID: " + productDTO.getId());
        System.out.println("Product Name: " + productDTO.getProductName());
        System.out.println("salePrice: " + productDTO.getSalePrice());
        System.out.println("saleStartDate: " + productDTO.getSaleStartDate());
        System.out.println("saleEndDate: " + productDTO.getSaleEndDate());
        
        // Đặc biệt xử lý các trường liên quan đến sale
        // Nếu salePrice null hoặc là 0, đảm bảo tất cả thông tin sale đều null
        if (productDTO.getSalePrice() == null || (productDTO.getSalePrice() != null && productDTO.getSalePrice().compareTo(BigDecimal.ZERO) <= 0)) {
            System.out.println("UPDATE: SALE PRICE NULL hoặc <= 0 - XÓA TẤT CẢ THÔNG TIN GIẢM GIÁ");
            
            // Cập nhật trực tiếp vào entity để đảm bảo
            product.setSalePrice(null);
            product.setSaleStartDate(null);
            product.setSaleEndDate(null);
            
            System.out.println("Đã xóa thông tin giảm giá: salePrice=" + product.getSalePrice() + 
                                 ", saleStartDate=" + product.getSaleStartDate() + 
                                 ", saleEndDate=" + product.getSaleEndDate());
        } else {
            // Nếu có giá giảm giá hợp lệ
            System.out.println("UPDATE: SALE PRICE HỢP LỆ - CẬP NHẬT THÔNG TIN GIẢM GIÁ");
            
            product.setSalePrice(productDTO.getSalePrice());
            
            // Xử lý các ngày
            if (productDTO.getSaleStartDate() != null) {
                product.setSaleStartDate(productDTO.getSaleStartDate());
                System.out.println("Đã cập nhật saleStartDate: " + product.getSaleStartDate());
            } else {
                // Nếu không có ngày bắt đầu thì đặt mặc định là ngày hiện tại
                LocalDateTime now = LocalDateTime.now();
                product.setSaleStartDate(now);
                System.out.println("Đã đặt saleStartDate mặc định: " + now);
            }
            
            if (productDTO.getSaleEndDate() != null) {
                product.setSaleEndDate(productDTO.getSaleEndDate());
                System.out.println("Đã cập nhật saleEndDate: " + product.getSaleEndDate());
            } else {
                // Nếu không có ngày kết thúc thì mặc định là sau 1 tháng
                LocalDateTime endDate = LocalDateTime.now().plusMonths(1);
                product.setSaleEndDate(endDate);
                System.out.println("Đã đặt saleEndDate mặc định: " + endDate);
            }
            
            System.out.println("Thông tin giảm giá sau cập nhật: salePrice=" + product.getSalePrice() + 
                               ", saleStartDate=" + product.getSaleStartDate() + 
                               ", saleEndDate=" + product.getSaleEndDate());
        }
        
        // Validate thông tin giảm giá
        validateSaleInfo(productDTO);
        
        // Cập nhật thông tin cơ bản
        product.setProductName(productDTO.getProductName());
        
        if (productDTO.getDescription() != null) {
            product.setDescription(productDTO.getDescription());
        }
        
        if (productDTO.getShortDescription() != null) {
            product.setShortDescription(productDTO.getShortDescription());
        }
        
        product.setQuantity(productDTO.getQuantity());
        
        // Cập nhật trạng thái tồn kho dựa trên số lượng
        updateStockStatus(product);
        
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
        
        // Lưu sản phẩm đã cập nhật
        MarketPlace updatedProduct = marketPlaceRepository.save(product);
        
        // Log thông tin sau khi đã cập nhật
        System.out.println("===== THÔNG TIN SẢN PHẨM SAU KHI CẬP NHẬT =====");
        System.out.println("ID: " + updatedProduct.getId());
        System.out.println("Product Name: " + updatedProduct.getProductName());
        System.out.println("salePrice: " + updatedProduct.getSalePrice());
        System.out.println("saleStartDate: " + updatedProduct.getSaleStartDate());
        System.out.println("saleEndDate: " + updatedProduct.getSaleEndDate());
        System.out.println("isOnSale: " + updatedProduct.isOnSale());
        
        return marketPlaceMapper.toDTO(updatedProduct);
    }

    /**
     * Kiểm tra tính hợp lệ của thông tin khuyến mãi
     */
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
        
        // Cập nhật trạng thái tồn kho cho mỗi sản phẩm
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
        
        // Xử lý sắp xếp nếu không dùng pageable mặc định
        if (sortBy != null && !sortBy.isEmpty() && !sortBy.equals("newest")) {
            System.out.println("Đang áp dụng sắp xếp: " + sortBy);
            // Các lựa chọn sắp xếp phía client hiện tại:
            // newest, price-low, price-high, name-asc, name-desc, rating
            
            // Tạo sort mặc định theo updatedAt để luôn có sẵn sắp xếp phụ
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
            
            // Tạo pageable mới với sắp xếp đã chọn
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
    public MarketPlaceDTO updateProductWithImage(Integer id, MarketPlaceDTO productDTO) {
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
        // Cập nhật trạng thái tồn kho dựa trên số lượng
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
            
            // Kiểm tra và log trạng thái giảm giá
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
        
        // Lấy tất cả sản phẩm từ repository
        List<MarketPlace> allProducts = marketPlaceRepository.findAll();
        System.out.println("Tổng số sản phẩm cần làm mới: " + allProducts.size());
        
        List<MarketPlace> updatedProducts = new ArrayList<>();
        
        // Duyệt qua từng sản phẩm để làm mới
        for (MarketPlace product : allProducts) {
            boolean needsUpdate = false;
            
            // 1. Kiểm tra và cập nhật trạng thái tồn kho
            StockStatus originalStatus = product.getStockStatus();
            
            // Tính toán lại trạng thái tồn kho dựa trên số lượng
            StockStatus newStatus;
            if (product.getQuantity() <= 0) {
                newStatus = StockStatus.OUT_OF_STOCK;
            } else if (product.getQuantity() <= 10) {
                newStatus = StockStatus.LOW_STOCK;
            } else {
                newStatus = StockStatus.IN_STOCK;
            }
            
            // Nếu trạng thái đã thay đổi, cập nhật lại
            if (originalStatus != newStatus) {
                System.out.println("Sản phẩm ID " + product.getId() + " - " + product.getProductName() + 
                        ": Cập nhật trạng thái từ " + originalStatus + " thành " + newStatus);
                product.setStockStatus(newStatus);
                needsUpdate = true;
            }
            
            // 2. Kiểm tra và làm mới thông tin giảm giá
            boolean originalOnSale = product.isOnSale();  // Gọi phương thức để kiểm tra
            
            // Nếu đã có bất kỳ thay đổi nào, thêm vào danh sách cần cập nhật
            if (needsUpdate) {
                updatedProducts.add(product);
            }
        }
        
        // Lưu tất cả các sản phẩm đã cập nhật vào cơ sở dữ liệu
        if (!updatedProducts.isEmpty()) {
            System.out.println("Lưu " + updatedProducts.size() + " sản phẩm đã cập nhật vào database");
            marketPlaceRepository.saveAll(updatedProducts);
        } else {
            System.out.println("Không có sản phẩm nào cần cập nhật");
        }
        
        // Chuyển đổi tất cả sản phẩm thành DTO và trả về
        List<MarketPlaceDTO> productDTOs = allProducts.stream()
                .map(marketPlaceMapper::toDTO)
                .collect(Collectors.toList());
        
        System.out.println("===== HOÀN THÀNH LÀM MỚI DỮ LIỆU SẢN PHẨM =====");
        return productDTOs;
    }

    // Thêm phương thức xử lý dữ liệu ngày tháng trước khi thực hiện thao tác cập nhật
    private void processDateTimeFields(MarketPlaceDTO productDTO) {
        // Xử lý salePrice
        if (productDTO.getSalePrice() != null) {
            String salePriceStr = productDTO.getSalePrice().toString();
            if ("null".equals(salePriceStr) || "undefined".equals(salePriceStr) || "0".equals(salePriceStr)) {
                System.out.println("Service: Phát hiện salePrice là chuỗi '" + salePriceStr + "', chuyển thành null thực sự");
                productDTO.setSalePrice(null);
            }
        }
        
        // Xử lý saleStartDate
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
                    
                    // Thử chuyển đổi từ định dạng yyyy-MM-dd'T'HH:mm
                    if (dateStr.matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}.*")) {
                        try {
                            // Nếu chỉ có yyyy-MM-dd'T'HH:mm
                            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
                            LocalDateTime parsedDate = LocalDateTime.parse(dateStr.substring(0, 16), formatter);
                            productDTO.setSaleEndDate(parsedDate);
                            System.out.println("Service: Đã chuyển đổi saleEndDate thành công từ yyyy-MM-dd'T'HH:mm: " + parsedDate);
                        } catch (Exception e) {
                            // Nếu có vùng thời gian, thử ISO
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
        
        // Đảm bảo trường images là null để tránh lỗi conversion
        productDTO.setImages(null);
    }

} 