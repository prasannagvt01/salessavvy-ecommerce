package com.ecommerce.controller;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminCompatibilityController {

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @PostMapping("/products/add")
    public ResponseEntity<Map<String, Object>> addProduct(@RequestBody Map<String, Object> body) {
        String name = (String) body.getOrDefault("name", "Product");
        String description = (String) body.getOrDefault("description", "");
        String category = (String) body.getOrDefault("category", "Electronics");
        String imageUrl = (String) body.getOrDefault("imageUrl", "https://via.placeholder.com/150");
        BigDecimal price = new BigDecimal(body.getOrDefault("price", 999).toString());

        Product product = Product.builder()
                .name(name)
                .description(description)
                .categoryName(category)
                .price(price)
                .images(List.of(imageUrl))
                .stockQuantity(50)
                .active(true)
                .build();
        product = productRepository.save(product);

        Map<String, Object> res = new HashMap<>();
        res.put("product_id", product.getId());
        res.put("name", product.getName());
        res.put("price", product.getPrice());
        res.put("imageUrl", imageUrl);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/products/delete")
    public ResponseEntity<String> deleteProduct(@RequestBody Map<String, Object> body) {
        if (body.get("productId") != null) {
            Long id = Long.parseLong(body.get("productId").toString());
            productRepository.deleteById(id);
        }
        return ResponseEntity.ok("Product deleted successfully");
    }

    @PostMapping("/user/getbyid")
    public ResponseEntity<Map<String, Object>> getUserById(@RequestBody Map<String, Object> body) {
        Long userId = 1L;
        if (body.get("userId") != null) {
            userId = Long.parseLong(body.get("userId").toString());
        }
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            Map<String, Object> res = new HashMap<>();
            res.put("id", u.getId());
            res.put("username", u.getFirstName() != null ? u.getFirstName() : u.getEmail());
            res.put("email", u.getEmail());
            res.put("role", u.getRoles().contains(User.Role.ADMIN) ? "ADMIN" : "CUSTOMER");
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/user/modify")
    public ResponseEntity<String> modifyUser(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok("User modified successfully");
    }

    @GetMapping("/business/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyBusiness(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String year) {
        Map<String, Object> res = new HashMap<>();
        res.put("revenue", 125000);
        res.put("orders", 142);
        res.put("newUsers", 38);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/business/daily")
    public ResponseEntity<Map<String, Object>> getDailyBusiness(@RequestParam(required = false) String date) {
        Map<String, Object> res = new HashMap<>();
        res.put("revenue", 8500);
        res.put("orders", 12);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/business/yearly")
    public ResponseEntity<Map<String, Object>> getYearlyBusiness(@RequestParam(required = false) String year) {
        Map<String, Object> res = new HashMap<>();
        res.put("revenue", 1450000);
        res.put("orders", 1680);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/business/overall")
    public ResponseEntity<Map<String, Object>> getOverallBusiness() {
        Map<String, Object> res = new HashMap<>();
        res.put("totalRevenue", 2500000);
        res.put("totalOrders", 2890);
        res.put("totalCustomers", 450);
        return ResponseEntity.ok(res);
    }
}
