package com.ecommerce.service;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Cart;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final CouponService couponService;

    public CartResponse getCart() {
        User user = userService.getCurrentUser();
        Cart cart = getOrCreateCart(String.valueOf(user.getId()));
        return CartResponse.fromCart(cart);
    }

    public List<CartResponse> getAllCarts() {
        return cartRepository.findAll().stream()
                .map(CartResponse::fromCart)
                .collect(java.util.stream.Collectors.toList());
    }

    public CartResponse getCartById(String cartId) {
        Cart cart = cartRepository.findById(Long.parseLong(cartId))
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cartId));
        return CartResponse.fromCart(cart);
    }

    public CartResponse getCartByUserId(String userId) {
        Cart cart = getOrCreateCart(userId);
        return CartResponse.fromCart(cart);
    }

    public CartResponse addToCart(CartItemRequest request) {
        User user = userService.getCurrentUser();
        Cart cart = getOrCreateCart(String.valueOf(user.getId()));

        Product product = productRepository.findById(Long.parseLong(request.getProductId()))
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("Product is not available");
        }

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Available: " + product.getStockQuantity());
        }

        // Check if product already in cart
        Optional<Cart.CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            Cart.CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();

            if (product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Insufficient stock. Available: " + product.getStockQuantity());
            }

            item.setQuantity(newQuantity);
            BigDecimal price = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            item.setSubtotal(price.multiply(BigDecimal.valueOf(newQuantity)));
        } else {
            BigDecimal price = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            String productImage = product.getImages() != null && !product.getImages().isEmpty()
                    ? product.getImages().get(0)
                    : null;

            Cart.CartItem newItem = Cart.CartItem.builder()
                    .productId(String.valueOf(product.getId()))
                    .productName(product.getName())
                    .productImage(productImage)
                    .price(price)
                    .quantity(request.getQuantity())
                    .subtotal(price.multiply(BigDecimal.valueOf(request.getQuantity())))
                    .build();

            cart.getItems().add(newItem);
        }

        cart.recalculateTotals();
        cart = cartRepository.save(cart);
        return CartResponse.fromCart(cart);
    }

    public CartResponse updateCartItem(String productId, int quantity) {
        User user = userService.getCurrentUser();
        Cart cart = cartRepository.findByUserId(String.valueOf(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", String.valueOf(user.getId())));

        Cart.CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        Product product = productRepository.findById(Long.parseLong(productId))
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            if (product.getStockQuantity() < quantity) {
                throw new BadRequestException("Insufficient stock. Available: " + product.getStockQuantity());
            }
            item.setQuantity(quantity);
            item.setSubtotal(item.getPrice().multiply(BigDecimal.valueOf(quantity)));
        }

        cart.recalculateTotals();
        cart = cartRepository.save(cart);
        return CartResponse.fromCart(cart);
    }

    public CartResponse removeFromCart(String productId) {
        User user = userService.getCurrentUser();
        Cart cart = cartRepository.findByUserId(String.valueOf(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", String.valueOf(user.getId())));

        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        cart.recalculateTotals();
        cart = cartRepository.save(cart);
        return CartResponse.fromCart(cart);
    }

    public void clearCart() {
        User user = userService.getCurrentUser();
        Cart cart = cartRepository.findByUserId(String.valueOf(user.getId())).orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cart.recalculateTotals();
            cartRepository.save(cart);
        }
    }

    public Cart getCartEntity() {
        User user = userService.getCurrentUser();
        return getOrCreateCart(String.valueOf(user.getId()));
    }

    public CartResponse applyCoupon(String code) {
        User user = userService.getCurrentUser();
        Cart cart = getOrCreateCart(String.valueOf(user.getId()));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot apply coupon to empty cart");
        }

        List<String> productIds = cart.getItems().stream().map(Cart.CartItem::getProductId)
                .collect(java.util.stream.Collectors.toList());
        List<Long> productLongIds = productIds.stream().map(Long::parseLong)
                .collect(java.util.stream.Collectors.toList());
        List<String> categoryIds = productRepository.findAllById(productLongIds).stream()
                .map(Product::getCategoryId)
                .collect(java.util.stream.Collectors.toList());

        com.ecommerce.model.Coupon coupon = couponService.validateCoupon(code, cart.getTotalPrice(), productIds,
                categoryIds);
        BigDecimal discount = couponService.calculateDiscount(coupon, cart.getTotalPrice());

        cart.setAppliedCoupon(code);
        cart.setDiscount(discount);
        cart.recalculateTotals();

        cart = cartRepository.save(cart);
        return CartResponse.fromCart(cart);
    }

    public CartResponse removeCoupon() {
        User user = userService.getCurrentUser();
        Cart cart = getOrCreateCart(String.valueOf(user.getId()));

        cart.setAppliedCoupon(null);
        cart.setDiscount(BigDecimal.ZERO);
        cart.recalculateTotals();

        cart = cartRepository.save(cart);
        return CartResponse.fromCart(cart);
    }

    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .userId(userId)
                            .items(new ArrayList<>())
                            .totalPrice(BigDecimal.ZERO)
                            .totalItems(0)
                            .build();
                    return cartRepository.save(newCart);
                });
    }
}
