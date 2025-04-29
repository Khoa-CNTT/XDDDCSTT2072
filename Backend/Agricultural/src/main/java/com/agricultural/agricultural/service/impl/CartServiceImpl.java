package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.CartDTO;
import com.agricultural.agricultural.dto.CartItemDTO;
import com.agricultural.agricultural.dto.CartResponseDTO;
import com.agricultural.agricultural.dto.VoucherDTO;
import com.agricultural.agricultural.entity.Cart;
import com.agricultural.agricultural.entity.CartItem;
import com.agricultural.agricultural.entity.MarketPlace;
import com.agricultural.agricultural.entity.ProductVariant;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.Voucher;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.CartMapper;
import com.agricultural.agricultural.repository.ICartItemRepository;
import com.agricultural.agricultural.repository.ICartRepository;
import com.agricultural.agricultural.repository.IMarketPlaceRepository;
import com.agricultural.agricultural.repository.IProductVariantRepository;
import com.agricultural.agricultural.repository.impl.UserRepository;
import com.agricultural.agricultural.repository.IVoucherRepository;
import com.agricultural.agricultural.service.ICartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
    private final IVoucherRepository voucherRepository;
    
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
                    .isSelected(true) // Mặc định chọn sản phẩm khi thêm vào giỏ
                    .shopId(product.getUser().getId())
                    .shopName(product.getUser().getUsername())
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
    
    @Override
    @Transactional
    public CartDTO selectCartItems(List<Integer> cartItemIds, boolean selected) {
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // Cập nhật trạng thái chọn cho các item
        if (cartItemIds != null && !cartItemIds.isEmpty()) {
            for (Integer itemId : cartItemIds) {
                CartItem cartItem = cartItemRepository.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng với ID: " + itemId));
                
                // Kiểm tra cart item có thuộc giỏ hàng của người dùng không
                if (!Objects.equals(cartItem.getCart().getId(), cart.getId())) {
                    throw new BadRequestException("Sản phẩm này không thuộc giỏ hàng của bạn");
                }
                
                cartItem.setIsSelected(selected);
                cartItemRepository.save(cartItem);
            }
        }
        
        // Tính lại tổng tiền
        cart.recalculateTotals();
        cartRepository.save(cart);
        
        // Trả về thông tin giỏ hàng
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(cartMapper.toCartItemDTOList(cart.getCartItems()));
        
        return cartDTO;
    }
    
    @Override
    @Transactional
    public CartDTO selectAllCartItems(boolean selected) {
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // Cập nhật trạng thái chọn cho tất cả item
        for (CartItem cartItem : cart.getCartItems()) {
            cartItem.setIsSelected(selected);
            cartItemRepository.save(cartItem);
        }
        
        // Tính lại tổng tiền
        cart.recalculateTotals();
        cartRepository.save(cart);
        
        // Trả về thông tin giỏ hàng
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(cartMapper.toCartItemDTOList(cart.getCartItems()));
        
        return cartDTO;
    }
    
    @Override
    @Transactional
    public CartDTO applyVoucher(String voucherCode) {
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // Kiểm tra mã voucher
        Voucher voucher = voucherRepository.findByCodeAndIsActiveTrue(voucherCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá hợp lệ: " + voucherCode));
        
        // Kiểm tra voucher có hợp lệ không
        if (!voucher.isValid()) {
            throw new BadRequestException("Mã giảm giá đã hết hạn hoặc đã hết lượt sử dụng");
        }
        
        // Kiểm tra voucher có thuộc về người dùng hiện tại không (nếu voucher chỉ định người dùng)
        if (voucher.getShopId() != null && !voucher.getShopId().equals(currentUser.getId())) {
            throw new BadRequestException("Mã giảm giá này không thuộc về bạn");
        }
        
        // Kiểm tra điều kiện áp dụng
        if (voucher.getMinOrderAmount() != null && cart.getSubtotal().compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Đơn hàng của bạn chưa đạt giá trị tối thiểu " 
                    + voucher.getMinOrderAmount() + "đ để áp dụng mã giảm giá này");
        }
        
        // Áp dụng voucher dựa vào loại
        if ("PLATFORM".equals(voucher.getType())) {
            // Voucher toàn sàn
            cart.setAppliedVoucherCode(voucherCode);
            
            // Tính giảm giá
            BigDecimal discount = voucher.calculateDiscount(cart.getSubtotal(), cart.getShippingFee());
            cart.setDiscountAmount(discount);
            
        } else if ("SHOP".equals(voucher.getType())) {
            // Voucher của shop
            // Kiểm tra giỏ hàng có sản phẩm của shop này không
            boolean hasShopItems = cart.getCartItems().stream()
                    .anyMatch(item -> Objects.equals(item.getShopId(), voucher.getShopId()) && Boolean.TRUE.equals(item.getIsSelected()));
            
            if (!hasShopItems) {
                throw new BadRequestException("Bạn không có sản phẩm nào từ shop " + voucher.getShopName() + " trong giỏ hàng");
            }
            
            // Tính tổng giá trị sản phẩm của shop
            BigDecimal shopSubtotal = cart.getShopSubtotal(voucher.getShopId());
            
            // Kiểm tra điều kiện áp dụng với tổng shop
            if (voucher.getMinOrderAmount() != null && shopSubtotal.compareTo(voucher.getMinOrderAmount()) < 0) {
                throw new BadRequestException("Tổng giá trị sản phẩm từ shop " + voucher.getShopName() 
                        + " chưa đạt giá trị tối thiểu " + voucher.getMinOrderAmount() + "đ để áp dụng mã giảm giá này");
            }
            
            // Lưu thông tin voucher shop
            String shopVouchers = cart.getAppliedShopVouchers();
            if (shopVouchers == null) {
                shopVouchers = voucher.getShopId() + ":" + voucherCode;
            } else {
                // Kiểm tra đã có voucher của shop này chưa
                String[] vouchers = shopVouchers.split(",");
                StringBuilder newVouchers = new StringBuilder();
                boolean replaced = false;
                
                for (String v : vouchers) {
                    String[] parts = v.split(":");
                    if (parts.length == 2 && parts[0].equals(voucher.getShopId().toString())) {
                        // Thay thế voucher cũ
                        newVouchers.append(voucher.getShopId()).append(":").append(voucherCode);
                        replaced = true;
                    } else {
                        // Giữ nguyên voucher của shop khác
                        newVouchers.append(v);
                    }
                    newVouchers.append(",");
                }
                
                if (!replaced) {
                    // Thêm mới nếu chưa có
                    newVouchers.append(voucher.getShopId()).append(":").append(voucherCode);
                } else {
                    // Xóa dấu phẩy cuối cùng nếu thay thế
                    newVouchers.deleteCharAt(newVouchers.length() - 1);
                }
                
                shopVouchers = newVouchers.toString();
            }
            
            cart.setAppliedShopVouchers(shopVouchers);
            
            // Áp dụng giảm giá cho sản phẩm của shop
            BigDecimal discount = voucher.calculateDiscount(shopSubtotal, null);
            
            // Phân bổ giảm giá cho từng sản phẩm
            distributeDiscountToShopItems(cart, voucher.getShopId(), discount);
            
        } else if (Boolean.TRUE.equals(voucher.getIsShippingVoucher())) {
            // Voucher miễn phí vận chuyển
            BigDecimal discount = voucher.calculateDiscount(cart.getSubtotal(), cart.getShippingFee());
            cart.setShippingDiscount(discount);
        }
        
        // Tính lại tổng tiền
        cart.recalculateTotals();
        cartRepository.save(cart);
        
        // Trả về thông tin giỏ hàng
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(cartMapper.toCartItemDTOList(cart.getCartItems()));
        
        return cartDTO;
    }
    
    /**
     * Phân bổ giảm giá cho các sản phẩm của một shop
     */
    private void distributeDiscountToShopItems(Cart cart, Integer shopId, BigDecimal totalDiscount) {
        // Lấy danh sách sản phẩm được chọn của shop
        List<CartItem> shopItems = cart.getCartItems().stream()
                .filter(item -> Objects.equals(item.getShopId(), shopId) && Boolean.TRUE.equals(item.getIsSelected()))
                .toList();
        
        // Tính tổng giá trị sản phẩm của shop
        BigDecimal shopSubtotal = BigDecimal.ZERO;
        for (CartItem item : shopItems) {
            shopSubtotal = shopSubtotal.add(item.getTotalPrice());
        }
        
        // Phân bổ giảm giá theo tỷ lệ
        for (CartItem item : shopItems) {
            if (shopSubtotal.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal ratio = item.getTotalPrice().divide(shopSubtotal, 4, java.math.RoundingMode.HALF_UP);
                BigDecimal itemDiscount = totalDiscount.multiply(ratio).setScale(2, java.math.RoundingMode.HALF_UP);
                item.setDiscountAmount(itemDiscount);
                cartItemRepository.save(item);
            }
        }
    }
    
    @Override
    @Transactional
    public CartDTO removeVoucher(String type, Integer shopId) {
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        if ("PLATFORM".equals(type)) {
            // Xóa voucher toàn sàn
            cart.setAppliedVoucherCode(null);
            cart.setDiscountAmount(BigDecimal.ZERO);
            
        } else if ("SHOP".equals(type) && shopId != null) {
            // Xóa voucher của shop
            String shopVouchers = cart.getAppliedShopVouchers();
            if (shopVouchers != null && !shopVouchers.isEmpty()) {
                String[] vouchers = shopVouchers.split(",");
                StringBuilder newVouchers = new StringBuilder();
                
                for (String v : vouchers) {
                    String[] parts = v.split(":");
                    if (parts.length == 2 && !parts[0].equals(shopId.toString())) {
                        // Giữ lại voucher của các shop khác
                        newVouchers.append(v).append(",");
                    }
                }
                
                // Xóa dấu phẩy cuối cùng nếu có
                if (newVouchers.length() > 0 && newVouchers.charAt(newVouchers.length() - 1) == ',') {
                    newVouchers.deleteCharAt(newVouchers.length() - 1);
                }
                
                cart.setAppliedShopVouchers(newVouchers.toString());
            }
            
            // Xóa giảm giá áp dụng cho sản phẩm của shop
            for (CartItem item : cart.getCartItems()) {
                if (Objects.equals(item.getShopId(), shopId)) {
                    item.setDiscountAmount(BigDecimal.ZERO);
                    cartItemRepository.save(item);
                }
            }
            
        } else if ("SHIPPING".equals(type)) {
            // Xóa voucher miễn phí vận chuyển
            cart.setShippingDiscount(BigDecimal.ZERO);
        }
        
        // Tính lại tổng tiền
        cart.recalculateTotals();
        cartRepository.save(cart);
        
        // Trả về thông tin giỏ hàng
        CartDTO cartDTO = cartMapper.toDTO(cart);
        cartDTO.setCartItems(cartMapper.toCartItemDTOList(cart.getCartItems()));
        
        return cartDTO;
    }
    
    @Override
    @Transactional
    public CartResponseDTO getCartResponse() {
        // Lấy thông tin người dùng và giỏ hàng
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // Tạo response
        CartResponseDTO response = CartResponseDTO.builder()
                .id(cart.getId())
                .userId(currentUser.getId())
                .userName(currentUser.getUsername())
                .totalItems(cart.getTotalItems())
                .subtotal(cart.getSubtotal())
                .shippingFee(cart.getShippingFee())
                .shippingDiscount(cart.getShippingDiscount())
                .discountAmount(cart.getDiscountAmount())
                .finalTotal(cart.getFinalTotal())
                .appliedVoucherCode(cart.getAppliedVoucherCode())
                .build();
        
        // Nhóm sản phẩm theo shop
        Map<Integer, List<CartItem>> itemsByShop = cart.getItemsByShop();
        
        // Tạo danh sách shop
        List<CartResponseDTO.ShopGroupDTO> shopGroups = new ArrayList<>();
        
        for (Map.Entry<Integer, List<CartItem>> entry : itemsByShop.entrySet()) {
            Integer shopId = entry.getKey();
            List<CartItem> shopItems = entry.getValue();
            
            // Lấy thông tin shop
            String shopName = "";
            if (!shopItems.isEmpty() && shopItems.get(0).getShopName() != null) {
                shopName = shopItems.get(0).getShopName();
            }
            
            // Tạo shop group
            CartResponseDTO.ShopGroupDTO shopGroup = CartResponseDTO.ShopGroupDTO.builder()
                    .shopId(shopId)
                    .shopName(shopName)
                    .shopSubtotal(cart.getShopSubtotal(shopId))
                    .build();
            
            // Thêm các item của shop
            shopGroup.setItems(cartMapper.toCartItemDTOList(shopItems));
            
            // Thêm vào danh sách
            shopGroups.add(shopGroup);
        }
        
        response.setShopGroups(shopGroups);
        
        // Lấy danh sách voucher
        List<Voucher> platformVouchers = voucherRepository.findAllActivePlatformVouchers(LocalDateTime.now());
        List<VoucherDTO> availableVouchers = platformVouchers.stream()
                .map(this::convertToVoucherDTO)
                .toList();
        
        response.setAvailableVouchers(availableVouchers);
        
        // Thêm voucher shop cho mỗi shop group
        for (CartResponseDTO.ShopGroupDTO shopGroup : shopGroups) {
            List<Voucher> shopVouchers = voucherRepository.findAllActiveShopVouchers(LocalDateTime.now(), shopGroup.getShopId());
            List<VoucherDTO> shopVoucherDTOs = shopVouchers.stream()
                    .map(this::convertToVoucherDTO)
                    .toList();
            
            shopGroup.setShopVouchers(shopVoucherDTOs);
        }
        
        return response;
    }
    
    private VoucherDTO convertToVoucherDTO(Voucher voucher) {
        return VoucherDTO.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .description(voucher.getDescription())
                .discountAmount(voucher.getDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .isActive(voucher.getIsActive())
                .type(voucher.getType())
                .shopId(voucher.getShopId())
                .shopName(voucher.getShopName())
                .isShippingVoucher(voucher.getIsShippingVoucher())
                .shippingDiscountAmount(voucher.getShippingDiscountAmount())
                .minShippingFee(voucher.getMinShippingFee())
                .build();
    }
} 