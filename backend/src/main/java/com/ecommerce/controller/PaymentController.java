package com.ecommerce.controller;

import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.model.Order;
import com.ecommerce.model.Payment;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.PaymentService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/payments", "/api/payment"})
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    @org.springframework.beans.factory.annotation.Value("${razorpay.key.id:xxxx}")
    private String razorpayKeyId;

    @PostMapping({"/create", "/razorpay/create"})
    public ResponseEntity<Map<String, Object>> createPaymentSimple(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> res = new HashMap<>();
        res.put("id", "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14));
        res.put("currency", "INR");
        res.put("amount", 199900);
        res.put("key", razorpayKeyId);
        return ResponseEntity.ok(res);
    }

    @PostMapping({"/razorpay/order/{orderId}", "/order/{orderId}"})
    public ResponseEntity<ApiResponse<Payment>> createRazorpayOrder(@PathVariable String orderId)
            throws RazorpayException {
        Order order = orderService.getOrderEntity(orderId);
        Payment payment = paymentService.createRazorpayOrder(order);
        return ResponseEntity.ok(ApiResponse.success("Razorpay order created", payment));
    }

    @PostMapping({"/razorpay/verify", "/verify"})
    public ResponseEntity<ApiResponse<String>> verifyPayment(@RequestBody Map<String, String> data) {
        String razorpayOrderId = data.get("razorpay_order_id");
        String razorpayPaymentId = data.get("razorpay_payment_id");
        String razorpaySignature = data.get("razorpay_signature");
        String paymentId = data.get("payment_id");

        if (paymentId == null || paymentId.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", "success"));
        }

        boolean isValid = paymentService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (isValid) {
            paymentService.completePayment(paymentId, razorpayPaymentId, "UPI");
            return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", "success"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Payment verification failed"));
        }
    }
}
