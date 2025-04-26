package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.CartDTO;
import com.agricultural.agricultural.dto.CartItemDTO;
import com.agricultural.agricultural.entity.Cart;
import com.agricultural.agricultural.entity.CartItem;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.ProductVariant;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.CartMapper;
import com.agricultural.agricultural.repository.ICartItemRepository;
import com.agricultural.agricultural.repository.ICartRepository;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.repository.IProductVariantRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.service.ICartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements ICartService {
    
    private final ICartRepository cartRepository;
    private final ICartItemRepository cartItemRepository;
    private final IMarketPlaceRepository marketPlaceRepository;
    private final IProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;
    
    /**
     * Lấy thông tin người dùng hiện tại từ SecurityContext
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            throw new BadRequestException("Không thể xác thực thông tin người dùng");
        }
        
        User currentUser = (User) principal;
        if (false) {
            throw new BadRequestException("Không tìm thấy thông tin người dùng");
        }
        
        return currentUser;
    }
    
    /**
     * Lấy hoặc tạo giỏ hàng cho người dùng
     */
    private Cart getOrCreateCart(User user) {
        Optional<Cart> existingCart = cartRepository.findByUserIdWithCartItems(user.getId());
        
        if (existingCart.isPresent()) {
            return existingCart.get();
        }
        
        // Tạo giỏ hàng mới
        Cart newCart = Cart.builder()
                .user(user)
                .totalItems(0)
                .subtotal(BigDecimal.ZERO)
                .deleted(false)
                .build();
        
        return cartRepository.save(newCart);
    }
    
    @Override
    @Transactional
    public CartDTO getCurrentUserCart() {
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(cartMapper.toCartItemDTOList(cart.getCartItems()));
        
        return cartDTO;
    }
    
    @Override
    @Transactional
    public CartDTO getCartByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        Cart cart = getOrCreateCart(user);
        
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(cartMapper.toCartItemDTOList(cart.getCartItems()));
        
        return cartDTO;
    }
    
    @Override
    @Transactional
    public CartDTO addItemToCart(Integer productId, Integer quantity, Integer variantId, String notes) {
        if (quantity <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }
        
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // Lấy thông tin sản phẩm
        MarketPlace product = marketPlaceRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));
        
        // Kiểm tra số lượng tồn kho
        if (product.getQuantity() < quantity) {
            throw new BadRequestException("Sản phẩm " + product.getProductName() + " chỉ còn " + product.getQuantity() + " sản phẩm");
        }
        
        // Kiểm tra variant nếu có
        ProductVariant variant = null;
        if (variantId != null) {
            variant = productVariantRepository.findById(variantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể sản phẩm với ID: " + variantId));
            
            // Kiểm tra variant có thuộc sản phẩm không
            if (!Objects.equals(variant.getProduct().getId(), productId)) {
                throw new BadRequestException("Biến thể sản phẩm không thuộc sản phẩm này");
            }
            
            // Kiểm tra số lượng tồn kho của variant
            if (variant.getQuantity() < quantity) {
                throw new BadRequestException("Biến thể " + variant.getName() + " chỉ còn " + variant.getQuantity() + " sản phẩm");
            }
        }
        
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        Optional<CartItem> existingItem;
        if (variant != null) {
            existingItem = cartItemRepository.findByCartIdAndProductIdAndVariantId(cart.getId(), productId, variantId);
        } else {
            existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        }
        
        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Cập nhật số lượng
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            
            // Kiểm tra lại số lượng tồn kho
            if (variant != null) {
                if (variant.getQuantity() < newQuantity) {
                    throw new BadRequestException("Biến thể " + variant.getName() + " chỉ còn " + variant.getQuantity() + " sản phẩm");
                }
            } else {
                if (product.getQuantity() < newQuantity) {
                    throw new BadRequestException("Sản phẩm " + product.getProductName() + " chỉ còn " + product.getQuantity() + " sản phẩm");
                }
            }
            
            cartItem.setQuantity(newQuantity);
            if (notes != null) {
                cartItem.setNotes(notes);
            }
        } else {
            // Tạo item mới
            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
                    .quantity(quantity)
                    .notes(notes)
                    .build();

            // Tính giá an toàn
            BigDecimal price = BigDecimal.ZERO;
            if (variant != null && variant.getFinalPrice() != null) {
                price = variant.getFinalPrice();
            } else if (product != null && product.getCurrentPrice() != null) {
                price = product.getCurrentPrice();
            }
            cartItem.setUnitPrice(price);
            
            // Tính tổng tiền
            cartItem.calculatePrices();
            
            // Thêm vào giỏ hàng
            cart.addItem(cartItem);
        }
        
        // Lưu thay đổi
        cartItemRepository.save(cartItem);
        cart.recalculateTotals();
        cartRepository.save(cart);
        
        // Trả về thông tin giỏ hàng
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(cartMapper.toCartItemDTOList(cart.getCartItems()));
        
        return cartDTO;
    }
    
    @Override
    @Transactional
    public CartDTO updateCartItem(Integer cartItemId, Integer quantity, String notes) {
        if (quantity <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }
        
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // Lấy thông tin cart item
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng với ID: " + cartItemId));
        
        // Kiểm tra cart item có thuộc giỏ hàng của người dùng không
        if (!Objects.equals(cartItem.getCart().getId(), cart.getId())) {
            throw new BadRequestException("Sản phẩm này không thuộc giỏ hàng của bạn");
        }
        
        // Kiểm tra số lượng tồn kho
        MarketPlace product = cartItem.getProduct();
        ProductVariant variant = cartItem.getVariant();
        
        if (variant != null) {
            if (variant.getQuantity() < quantity) {
                throw new BadRequestException("Biến thể " + variant.getName() + " chỉ còn " + variant.getQuantity() + " sản phẩm");
            }
        } else {
            if (product.getQuantity() < quantity) {
                throw new BadRequestException("Sản phẩm " + product.getProductName() + " chỉ còn " + product.getQuantity() + " sản phẩm");
            }
        }
        
        // Cập nhật thông tin
        cartItem.setQuantity(quantity);
        if (notes != null) {
            cartItem.setNotes(notes);
        }
        
        // Tính lại giá
        cartItem.calculatePrices();
        
        // Lưu thay đổi
        cartItemRepository.save(cartItem);
        cart.recalculateTotals();
        cartRepository.save(cart);
        
        // Trả về thông tin giỏ hàng
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(cartMapper.toCartItemDTOList(cart.getCartItems()));
        
        return cartDTO;
    }
    
    @Override
    @Transactional
    public CartDTO removeCartItem(Integer cartItemId) {
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // Lấy thông tin cart item
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng với ID: " + cartItemId));
        
        // Kiểm tra cart item có thuộc giỏ hàng của người dùng không
        if (!Objects.equals(cartItem.getCart().getId(), cart.getId())) {
            throw new BadRequestException("Sản phẩm này không thuộc giỏ hàng của bạn");
        }
        
        // Xóa cart item
        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);
        
        // Lưu thay đổi
        cart.recalculateTotals();
        cartRepository.save(cart);
        
        // Trả về thông tin giỏ hàng
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(cartMapper.toCartItemDTOList(cart.getCartItems()));
        
        return cartDTO;
    }
    
    @Override
    @Transactional
    public CartDTO clearCart() {
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // Xóa tất cả cart item
        cartItemRepository.deleteByCartId(cart.getId());
        
        // Làm trống giỏ hàng
        cart.clearItems();
        cartRepository.save(cart);
        
        // Trả về thông tin giỏ hàng
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(new ArrayList<>());
        
        return cartDTO;
    }
    
    @Override
    @Transactional
    public List<CartItemDTO> validateCart() {
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        List<CartItemDTO> invalidItems = new ArrayList<>();
        
        // Kiểm tra từng sản phẩm trong giỏ hàng
        for (CartItem item : cart.getCartItems()) {
            MarketPlace product = item.getProduct();
            ProductVariant variant = item.getVariant();
            
            boolean isValid = true;
            CartItemDTO itemDTO = cartMapper.toDTO(item);
            
            // Kiểm tra sản phẩm còn tồn tại không
            if (product == null) {
                itemDTO.setNotes("Sản phẩm không còn tồn tại");
                isValid = false;
            } else {
                // Kiểm tra số lượng tồn kho
                if (variant != null) {
                    if (variant.getQuantity() < item.getQuantity()) {
                        itemDTO.setNotes("Biến thể chỉ còn " + variant.getQuantity() + " sản phẩm");
                        isValid = false;
                    }
                } else {
                    if (product.getQuantity() < item.getQuantity()) {
                        itemDTO.setNotes("Sản phẩm chỉ còn " + product.getQuantity() + " sản phẩm");
                        isValid = false;
                    }
                }
                
                // Kiểm tra giá có thay đổi không
                BigDecimal currentPrice;
                if (variant != null) {
                    currentPrice = variant.getFinalPrice();
                } else {
                    currentPrice = product.getCurrentPrice();
                }
                
                if (!Objects.equals(currentPrice, item.getUnitPrice())) {
                    itemDTO.setNotes("Giá sản phẩm đã thay đổi từ " + item.getUnitPrice() + " thành " + currentPrice);
                    isValid = false;
                }
            }
            
            if (!isValid) {
                invalidItems.add(itemDTO);
            }
        }
        
        return invalidItems;
    }
    
    @Override
    @Transactional
    public CartDTO calculateShippingFee(Integer addressId) {
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // TODO: Tính toán phí vận chuyển dựa trên địa chỉ và sản phẩm trong giỏ hàng
        // Đây chỉ là phí vận chuyển giả định để demo
        BigDecimal shippingFee = new BigDecimal("30000"); // 30.000 VND
        
        // Tính thuế (nếu cần)
        BigDecimal tax = cart.getSubtotal().multiply(new BigDecimal("0.1")); // 10% thuế
        
        // Trả về thông tin giỏ hàng
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(cartMapper.toCartItemDTOList(cart.getCartItems()));
        cartDTO.setEstimatedShippingFee(shippingFee);
        cartDTO.setEstimatedTax(tax);
        
        return cartDTO;
    }


} 