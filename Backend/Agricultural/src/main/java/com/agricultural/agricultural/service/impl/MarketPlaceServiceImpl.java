package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.MarketPlaceDTO;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.MarketPlaceMapper;
import com.agricultural.agricultural.repository.MarketPlaceRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.IMarketPlaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketPlaceServiceImpl implements IMarketPlaceService {
    private final MarketPlaceRepository marketPlaceRepository;
    private final UserRepository userRepository;
    private final MarketPlaceMapper marketPlaceMapper;


    @Override
    public MarketPlaceDTO createProduct(MarketPlaceDTO productDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOptional = userRepository.findByUserName(username);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        User user = userOptional.get();


        MarketPlace product = marketPlaceMapper.toEntity(productDTO);
        if (product == null) {
            throw new BadRequestException("Chuyển đổi DTO sang entity thất bại.");
        }

        product.setUser(user);
        MarketPlace savedProduct = marketPlaceRepository.save(product);

        return marketPlaceMapper.toDTO(savedProduct);
    }

    public MarketPlaceDTO updateProduct(Integer id, MarketPlaceDTO productDTO) {
        // Lấy thông tin người dùng hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("Người dùng chưa đăng nhập hoặc không hợp lệ.");
        }
        String currentProduct = authentication.getName();  // Tên người dùng hiện tại

        System.out.println("Current logged-in user: " + currentProduct);  // Log tên người dùng hiện tại

        // Lấy sản phẩm từ cơ sở dữ liệu
        MarketPlace product = marketPlaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        // Log thông tin người sở hữu sản phẩm
        System.out.println("Product owner: " + product.getUser().getUsername());  // Log người sở hữu sản phẩm

        // Kiểm tra quyền sở hữu sản phẩm
        if (!product.getUser().getUsername().equals(currentProduct)) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa bài viết này!");
        }

        // Kiểm tra giá trị của price và quantity trong productDTO
        if (productDTO.getPrice() != null && productDTO.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Giá sản phẩm phải lớn hơn 0");
        }

        // Log thông tin chi tiết của productDTO
        System.out.println("Updating product with new details: ");
        System.out.println("Product name: " + productDTO.getProductName());
        System.out.println("Product price: " + productDTO.getPrice());
        System.out.println("Product quantity: " + productDTO.getQuantity());
        System.out.println("Product description: " + productDTO.getDescription());

        // Cập nhật thông tin sản phẩm
        product.setProductName(productDTO.getProductName());
        product.setPrice(productDTO.getPrice());
        product.setQuantity(productDTO.getQuantity());
        product.setDescription(productDTO.getDescription());

        // Cập nhật entity từ DTO
        marketPlaceMapper.updateEntityFromDTO(productDTO, product);

        // Lưu sản phẩm đã được cập nhật
        MarketPlace updatedProduct = marketPlaceRepository.save(product);

        // Log thông tin sản phẩm sau khi lưu
        System.out.println("Product updated successfully: " + updatedProduct);

        // Trả về DTO của sản phẩm đã cập nhật
        return marketPlaceMapper.toDTO(updatedProduct);
    }



    @Override
    @Transactional
    public void deleteProduct(Integer id) {
        if (!marketPlaceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id);
        }
        marketPlaceRepository.deleteById(id);
    }

    @Override
    public MarketPlaceDTO getProduct(Integer id) {
        MarketPlace product = marketPlaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        return marketPlaceMapper.toDTO(product);
    }

    @Override
    public Page<MarketPlaceDTO> getAllProducts(Pageable pageable) {
        return marketPlaceRepository.findAll(pageable)
                .map(marketPlaceMapper::toDTO);
    }

//    @Override
//    public Page<MarketPlaceDTO> getProductsByUser(Integer userId, Pageable pageable) {
//        if (!userRepository.existsById(userId)) {
//            throw new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId);
//        }
//        return marketPlaceRepository.findByUserId(userId, pageable)
//                .map(marketPlaceMapper::toDTO);
//    }

    @Override
    public Page<MarketPlaceDTO> searchProducts(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BadRequestException("Từ khóa tìm kiếm không được để trống");
        }
        return marketPlaceRepository.searchProducts(keyword, pageable)
                .map(marketPlaceMapper::toDTO);
    }

    @Override
    public Page<MarketPlaceDTO> getAvailableProducts(Pageable pageable) {
        return marketPlaceRepository.findAvailableProducts(pageable)
                .map(marketPlaceMapper::toDTO);
    }

} 