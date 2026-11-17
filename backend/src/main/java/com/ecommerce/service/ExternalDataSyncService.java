package com.ecommerce.service;

import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalDataSyncService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private static final Map<String, String> CATEGORY_IMAGES = Map.ofEntries(
            Map.entry("beauty", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600"),
            Map.entry("fragrances", "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600"),
            Map.entry("furniture", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"),
            Map.entry("groceries", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"),
            Map.entry("electronics", "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600"),
            Map.entry("jewelery", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600"),
            Map.entry("men's clothing", "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600"),
            Map.entry("women's clothing", "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600")
    );

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            if (productRepository.count() < 15 || reviewRepository.count() == 0) {
                log.info("Syncing initial catalog from DummyJSON & Fake Store API...");
                syncAllExternalData();
            }
        } catch (Exception e) {
            log.warn("Initial external data sync skipped or partially failed: {}", e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> syncAllExternalData() {
        int categoriesAdded = 0;
        int dummyJsonProductsAdded = 0;
        int fakeStoreProductsAdded = 0;
        int reviewsAdded = 0;
        int usersAdded = 0;
        int cartsAdded = 0;

        // 1. Sync Products, Categories & Reviews from DummyJSON
        try {
            String body = fetchUrl("https://dummyjson.com/products?limit=30");
            if (body != null) {
                JSONObject root = new JSONObject(body);
                JSONArray products = root.optJSONArray("products");
                if (products != null) {
                    for (int i = 0; i < products.length(); i++) {
                        JSONObject item = products.getJSONObject(i);
                        String title = item.optString("title", "").trim();
                        if (title.isEmpty()) continue;

                        String rawCat = item.optString("category", "General");
                        Category category = getOrCreateCategory(rawCat);

                        Product existing = productRepository.findFirstByName(title).orElse(null);
                        if (existing == null) {
                            double usdPrice = item.optDouble("price", 19.99);
                            BigDecimal inrOriginalPrice = BigDecimal.valueOf(Math.max(199, Math.round(usdPrice * 80)))
                                    .setScale(2, RoundingMode.HALF_UP);
                            int discountPct = (int) Math.round(item.optDouble("discountPercentage", 10.0));
                            BigDecimal discountPrice = inrOriginalPrice
                                    .multiply(BigDecimal.valueOf(100 - Math.min(discountPct, 70)))
                                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                            List<String> images = new ArrayList<>();
                            JSONArray imgArr = item.optJSONArray("images");
                            if (imgArr != null) {
                                for (int j = 0; j < imgArr.length(); j++) {
                                    String imgUrl = imgArr.optString(j);
                                    if (imgUrl != null && !imgUrl.isBlank()) {
                                        images.add(imgUrl);
                                    }
                                }
                            }
                            String thumbnail = item.optString("thumbnail", "");
                            if (!thumbnail.isBlank() && !images.contains(thumbnail)) {
                                images.add(0, thumbnail);
                            }

                            List<String> tags = new ArrayList<>();
                            JSONArray tagArr = item.optJSONArray("tags");
                            if (tagArr != null) {
                                for (int j = 0; j < tagArr.length(); j++) {
                                    tags.add(tagArr.optString(j));
                                }
                            }

                            JSONArray reviewsArr = item.optJSONArray("reviews");
                            int reviewCount = reviewsArr != null ? reviewsArr.length() : 3;
                            double rating = Math.round(item.optDouble("rating", 4.4) * 10.0) / 10.0;

                            JSONObject dims = item.optJSONObject("dimensions");
                            String dimStr = dims != null
                                    ? dims.optDouble("width", 10) + "x" + dims.optDouble("height", 10) + "x" + dims.optDouble("depth", 5) + " cm"
                                    : "15x10x5 cm";

                            Product product = Product.builder()
                                    .name(title)
                                    .description(item.optString("description", title))
                                    .brand(item.optString("brand", "SalesSavvy Select"))
                                    .price(inrOriginalPrice)
                                    .discountPrice(discountPrice)
                                    .discountPercentage(discountPct)
                                    .categoryId(String.valueOf(category.getId()))
                                    .categoryName(category.getName())
                                    .images(images)
                                    .stockQuantity(Math.max(15, item.optInt("stock", 25)))
                                    .lowStockThreshold(5)
                                    .active(true)
                                    .featured(i < 8)
                                    .averageRating(rating)
                                    .reviewCount(reviewCount)
                                    .tags(tags)
                                    .specs(Product.ProductSpecs.builder()
                                            .weight(item.optInt("weight", 250) + "g")
                                            .dimensions(dimStr)
                                            .warranty(item.optString("warrantyInformation", "1 Year Warranty"))
                                            .build())
                                    .createdAt(LocalDateTime.now())
                                    .updatedAt(LocalDateTime.now())
                                    .build();

                            product = productRepository.save(product);
                            dummyJsonProductsAdded++;

                            // Save DummyJSON reviews
                            if (reviewsArr != null) {
                                for (int r = 0; r < reviewsArr.length(); r++) {
                                    JSONObject revObj = reviewsArr.getJSONObject(r);
                                    Review review = Review.builder()
                                            .productId(String.valueOf(product.getId()))
                                            .userId("dummyjson-" + (r + 1))
                                            .userName(revObj.optString("reviewerName", "Verified Buyer"))
                                            .rating(Math.max(1, Math.min(5, revObj.optInt("rating", 5))))
                                            .title(revObj.optInt("rating", 5) >= 4 ? "Great quality product!" : "Decent experience")
                                            .comment(revObj.optString("comment", "Really happy with this purchase."))
                                            .verified(true)
                                            .helpfulCount(r + 1)
                                            .createdAt(LocalDateTime.now().minusDays(r + 1))
                                            .updatedAt(LocalDateTime.now().minusDays(r + 1))
                                            .build();
                                    reviewRepository.save(review);
                                    reviewsAdded++;
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to sync DummyJSON products: {}", e.getMessage());
        }

        // 2. Sync Products, Categories & Ratings/Reviews from Fake Store API
        try {
            String body = fetchUrl("https://fakestoreapi.com/products");
            if (body != null) {
                JSONArray products = new JSONArray(body);
                for (int i = 0; i < products.length(); i++) {
                    JSONObject item = products.getJSONObject(i);
                    String title = item.optString("title", "").trim();
                    if (title.isEmpty()) continue;

                    String rawCat = item.optString("category", "General");
                    Category category = getOrCreateCategory(rawCat);

                    Product existing = productRepository.findFirstByName(title).orElse(null);
                    if (existing == null) {
                        double usdPrice = item.optDouble("price", 29.99);
                        BigDecimal inrOriginalPrice = BigDecimal.valueOf(Math.max(299, Math.round(usdPrice * 75)))
                                .setScale(2, RoundingMode.HALF_UP);
                        int discountPct = 15;
                        BigDecimal discountPrice = inrOriginalPrice
                                .multiply(BigDecimal.valueOf(85))
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                        String imageUrl = item.optString("image", "");
                        List<String> images = imageUrl.isBlank() ? new ArrayList<>() : List.of(imageUrl);

                        JSONObject ratingObj = item.optJSONObject("rating");
                        double rate = ratingObj != null ? ratingObj.optDouble("rate", 4.3) : 4.3;
                        int count = ratingObj != null ? ratingObj.optInt("count", 45) : 45;

                        Product product = Product.builder()
                                .name(title)
                                .description(item.optString("description", title))
                                .brand("FakeStore Originals")
                                .price(inrOriginalPrice)
                                .discountPrice(discountPrice)
                                .discountPercentage(discountPct)
                                .categoryId(String.valueOf(category.getId()))
                                .categoryName(category.getName())
                                .images(new ArrayList<>(images))
                                .stockQuantity(40)
                                .lowStockThreshold(5)
                                .active(true)
                                .featured(i < 6)
                                .averageRating(rate)
                                .reviewCount(count)
                                .tags(new ArrayList<>(List.of(rawCat.toLowerCase(), "popular", "bestseller")))
                                .specs(Product.ProductSpecs.builder()
                                        .warranty("1 Year Manufacturer Warranty")
                                        .material("Premium Grade")
                                        .build())
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();

                        product = productRepository.save(product);
                        fakeStoreProductsAdded++;

                        // Create sample reviews for FakeStore product
                        String[][] sampleReviews = {
                                {"Aarav Sharma", "5", "Excellent value for money!", "Exceeded my expectations. Fast delivery and authentic quality."},
                                {"Priya Nair", "4", "Very good quality", "Looks exactly like the photos and works great. Worth the price."}
                        };
                        for (int r = 0; r < sampleReviews.length; r++) {
                            Review review = Review.builder()
                                    .productId(String.valueOf(product.getId()))
                                    .userId("fakestore-" + (r + 1))
                                    .userName(sampleReviews[r][0])
                                    .rating(Integer.parseInt(sampleReviews[r][1]))
                                    .title(sampleReviews[r][2])
                                    .comment(sampleReviews[r][3])
                                    .verified(true)
                                    .helpfulCount(3 - r)
                                    .createdAt(LocalDateTime.now().minusDays(r + 2))
                                    .updatedAt(LocalDateTime.now().minusDays(r + 2))
                                    .build();
                            reviewRepository.save(review);
                            reviewsAdded++;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to sync Fake Store API products: {}", e.getMessage());
        }

        // 3. Ensure existing products have ratings & sample reviews if missing
        List<Product> allProducts = productRepository.findAll();
        for (Product product : allProducts) {
            String pid = String.valueOf(product.getId());
            List<Review> existingReviews = reviewRepository.findByProductId(pid);
            if (existingReviews.isEmpty()) {
                Review r1 = Review.builder()
                        .productId(pid)
                        .userId("sample-1")
                        .userName("Rahul Verma")
                        .rating(5)
                        .title("Highly recommended!")
                        .comment("Superb build quality and fast shipping. Will definitely buy again.")
                        .verified(true)
                        .helpfulCount(4)
                        .createdAt(LocalDateTime.now().minusDays(3))
                        .updatedAt(LocalDateTime.now().minusDays(3))
                        .build();
                Review r2 = Review.builder()
                        .productId(pid)
                        .userId("sample-2")
                        .userName("Sneha Kulkarni")
                        .rating(4)
                        .title("Good product for the price")
                        .comment("Works well and packaging was very secure.")
                        .verified(true)
                        .helpfulCount(2)
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .updatedAt(LocalDateTime.now().minusDays(1))
                        .build();
                reviewRepository.saveAll(List.of(r1, r2));
                reviewsAdded += 2;
                if (product.getAverageRating() <= 0) {
                    product.setAverageRating(4.5);
                }
                if (product.getReviewCount() <= 0) {
                    product.setReviewCount(2);
                }
                productRepository.save(product);
            }
        }

        // 4. Sync Users from DummyJSON & Fake Store API
        List<User> syncedUsers = new ArrayList<>();
        try {
            String usersJson = fetchUrl("https://dummyjson.com/users?limit=8");
            if (usersJson != null) {
                JSONObject root = new JSONObject(usersJson);
                JSONArray usersArr = root.optJSONArray("users");
                if (usersArr != null) {
                    for (int i = 0; i < usersArr.length(); i++) {
                        JSONObject u = usersArr.getJSONObject(i);
                        String email = u.optString("email", "").trim().toLowerCase();
                        if (email.isEmpty() || userRepository.existsByEmail(email)) {
                            userRepository.findByEmail(email).ifPresent(syncedUsers::add);
                            continue;
                        }
                        JSONObject addr = u.optJSONObject("address");
                        List<User.Address> addresses = new ArrayList<>();
                        if (addr != null) {
                            addresses.add(User.Address.builder()
                                    .street(addr.optString("address", "100 Main Street"))
                                    .city(addr.optString("city", "Bengaluru"))
                                    .state(addr.optString("state", "Karnataka"))
                                    .zipCode(addr.optString("postalCode", "560001"))
                                    .country(addr.optString("country", "India"))
                                    .isDefault(true)
                                    .build());
                        }
                        User newUser = User.builder()
                                .firstName(u.optString("firstName", "Customer"))
                                .lastName(u.optString("lastName", String.valueOf(i + 1)))
                                .email(email)
                                .password(passwordEncoder.encode("password123"))
                                .phone(u.optString("phone", "9876543210"))
                                .profileImage(u.optString("image", null))
                                .roles(new HashSet<>(Collections.singletonList(User.Role.USER)))
                                .addresses(addresses)
                                .active(true)
                                .build();
                        newUser = userRepository.save(newUser);
                        syncedUsers.add(newUser);
                        usersAdded++;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to sync DummyJSON users: {}", e.getMessage());
        }

        try {
            String fakeUsersJson = fetchUrl("https://fakestoreapi.com/users?limit=5");
            if (fakeUsersJson != null) {
                JSONArray usersArr = new JSONArray(fakeUsersJson);
                for (int i = 0; i < usersArr.length(); i++) {
                    JSONObject u = usersArr.getJSONObject(i);
                    String email = u.optString("email", "").trim().toLowerCase();
                    if (email.isEmpty() || userRepository.existsByEmail(email)) {
                        userRepository.findByEmail(email).ifPresent(syncedUsers::add);
                        continue;
                    }
                    JSONObject nameObj = u.optJSONObject("name");
                    String firstName = nameObj != null ? capitalize(nameObj.optString("firstname", "User")) : "User";
                    String lastName = nameObj != null ? capitalize(nameObj.optString("lastname", "Member")) : "Member";
                    JSONObject addr = u.optJSONObject("address");
                    List<User.Address> addresses = new ArrayList<>();
                    if (addr != null) {
                        addresses.add(User.Address.builder()
                                .street(addr.optString("street", "MG Road"))
                                .city(capitalize(addr.optString("city", "Mumbai")))
                                .state("Maharashtra")
                                .zipCode(addr.optString("zipcode", "400001"))
                                .country("India")
                                .isDefault(true)
                                .build());
                    }
                    User newUser = User.builder()
                            .firstName(firstName)
                            .lastName(lastName)
                            .email(email)
                            .password(passwordEncoder.encode("password123"))
                            .phone(u.optString("phone", "9876543210"))
                            .roles(new HashSet<>(Collections.singletonList(User.Role.USER)))
                            .addresses(addresses)
                            .active(true)
                            .build();
                    newUser = userRepository.save(newUser);
                    syncedUsers.add(newUser);
                    usersAdded++;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to sync Fake Store API users: {}", e.getMessage());
        }

        // 5. Sync Sample Carts for Users
        allProducts = productRepository.findAll();
        if (!allProducts.isEmpty() && !syncedUsers.isEmpty()) {
            for (int i = 0; i < Math.min(5, syncedUsers.size()); i++) {
                User u = syncedUsers.get(i);
                String uid = String.valueOf(u.getId());
                if (cartRepository.findByUserId(uid).isEmpty()) {
                    Product p1 = allProducts.get(i % allProducts.size());
                    Product p2 = allProducts.get((i + 3) % allProducts.size());

                    List<Cart.CartItem> items = new ArrayList<>();
                    BigDecimal price1 = p1.getDiscountPrice() != null ? p1.getDiscountPrice() : p1.getPrice();
                    items.add(Cart.CartItem.builder()
                            .productId(String.valueOf(p1.getId()))
                            .productName(p1.getName())
                            .productImage(p1.getImages() != null && !p1.getImages().isEmpty() ? p1.getImages().get(0) : null)
                            .price(price1)
                            .quantity(1)
                            .subtotal(price1)
                            .build());

                    BigDecimal price2 = p2.getDiscountPrice() != null ? p2.getDiscountPrice() : p2.getPrice();
                    items.add(Cart.CartItem.builder()
                            .productId(String.valueOf(p2.getId()))
                            .productName(p2.getName())
                            .productImage(p2.getImages() != null && !p2.getImages().isEmpty() ? p2.getImages().get(0) : null)
                            .price(price2)
                            .quantity(2)
                            .subtotal(price2.multiply(BigDecimal.valueOf(2)))
                            .build());

                    Cart cart = Cart.builder()
                            .userId(uid)
                            .items(items)
                            .build();
                    cart.recalculateTotals();
                    cartRepository.save(cart);
                    cartsAdded++;
                }
            }
        }

        categoriesAdded = (int) categoryRepository.count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalCategories", categoriesAdded);
        summary.put("dummyJsonProductsAdded", dummyJsonProductsAdded);
        summary.put("fakeStoreProductsAdded", fakeStoreProductsAdded);
        summary.put("totalProducts", productRepository.count());
        summary.put("reviewsAdded", reviewsAdded);
        summary.put("totalReviews", reviewRepository.count());
        summary.put("usersAdded", usersAdded);
        summary.put("totalUsers", userRepository.count());
        summary.put("cartsAdded", cartsAdded);
        summary.put("totalCarts", cartRepository.count());
        return summary;
    }

    private Category getOrCreateCategory(String rawCategory) {
        String displayName = formatCategoryName(rawCategory);
        String slug = rawCategory.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");

        return categoryRepository.findByName(displayName)
                .or(() -> categoryRepository.findBySlug(slug))
                .orElseGet(() -> {
                    String img = CATEGORY_IMAGES.getOrDefault(
                            rawCategory.toLowerCase(),
                            "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600"
                    );
                    Category cat = Category.builder()
                            .name(displayName)
                            .slug(slug)
                            .description("Explore our curated collection of " + displayName)
                            .image(img)
                            .active(true)
                            .displayOrder((int) categoryRepository.count() + 1)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return categoryRepository.save(cat);
                });
    }

    private String formatCategoryName(String raw) {
        if (raw == null || raw.isBlank()) return "General";
        String[] parts = raw.replace("-", " ").split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(Character.toUpperCase(part.charAt(0)))
                        .append(part.substring(1).toLowerCase());
            }
        }
        return sb.toString();
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return Character.toUpperCase(str.charAt(0)) + str.substring(1).toLowerCase();
    }

    private String fetchUrl(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "application/json")
                    .header("User-Agent", "SalesSavvy-Ecommerce/1.0")
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return response.body();
            }
        } catch (Exception e) {
            log.warn("HTTP fetch failed for {}: {}", url, e.getMessage());
        }
        return null;
    }
}
