package com.ecommerce.controller;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/cart", "/api/carts"})
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        CartResponse cart = cartService.getCart();
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CartResponse>>> getAllCarts() {
        return ResponseEntity.ok(ApiResponse.success(cartService.getAllCarts()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<CartResponse>> getCartByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCartByUserId(userId)));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<CartResponse>> getCartById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCartById(id)));
    }

    @GetMapping("/items")
    public ResponseEntity<List<?>> getCartItems() {
        try {
            CartResponse cart = cartService.getCart();
            return ResponseEntity.ok(cart != null && cart.getItems() != null ? cart.getItems() : List.of());
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/items/count")
    public ResponseEntity<Integer> getCartCount(@RequestParam(required = false) String username) {
        try {
            CartResponse cart = cartService.getCart();
            return ResponseEntity.ok(cart != null ? cart.getTotalItems() : 0);
        } catch (Exception e) {
            return ResponseEntity.ok(0);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(@RequestBody Map<String, Object> body) {
        String productId = null;
        if (body.get("productId") != null) {
            productId = body.get("productId").toString();
        } else if (body.get("product_id") != null) {
            productId = body.get("product_id").toString();
        }
        int quantity = 1;
        if (body.get("quantity") != null) {
            try {
                quantity = Integer.parseInt(body.get("quantity").toString());
            } catch (Exception ignored) {}
        }

        CartItemRequest request = new CartItemRequest();
        request.setProductId(productId != null ? productId : "1");
        request.setQuantity(quantity);

        CartResponse cart = cartService.addToCart(request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<CartResponse>> updateCart(@RequestBody Map<String, Object> body) {
        String productId = body.get("productId") != null ? body.get("productId").toString() : "1";
        int quantity = 1;
        if (body.get("quantity") != null) {
            try {
                quantity = Integer.parseInt(body.get("quantity").toString());
            } catch (Exception ignored) {}
        }
        CartResponse cart = cartService.updateCartItem(productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @PostMapping("/delete")
    public ResponseEntity<ApiResponse<CartResponse>> deleteFromCart(@RequestBody Map<String, Object> body) {
        String productId = body.get("productId") != null ? body.get("productId").toString() : "1";
        CartResponse cart = cartService.removeFromCart(productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @PutMapping("/update/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable String productId,
            @RequestParam int quantity) {
        CartResponse cart = cartService.updateCartItem(productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(@PathVariable String productId) {
        CartResponse cart = cartService.removeFromCart(productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }

    @PostMapping("/apply-coupon")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(@RequestBody java.util.Map<String, String> request) {
        String code = request.get("code");
        return ResponseEntity.ok(ApiResponse.success(cartService.applyCoupon(code)));
    }

    @DeleteMapping("/remove-coupon")
    public ResponseEntity<ApiResponse<CartResponse>> removeCoupon() {
        return ResponseEntity.ok(ApiResponse.success(cartService.removeCoupon()));
    }
}
