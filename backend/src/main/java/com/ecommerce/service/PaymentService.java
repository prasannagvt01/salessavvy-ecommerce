package com.ecommerce.service;

import com.ecommerce.model.Order;
import com.ecommerce.model.Payment;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;
    private final MailService mailService;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @Autowired
    public PaymentService(PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            @Autowired(required = false) @Nullable RazorpayClient razorpayClient,
            MailService mailService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
        this.mailService = mailService;
    }

    /**
     * Dummy payment processing - simulates successful payment
     * In production, integrate with real payment gateway (Stripe, Razorpay, etc.)
     */
    public Payment processPayment(Order order, String paymentMethod) {
        Payment.PaymentMethod method = parsePaymentMethod(paymentMethod);

        Payment payment = Payment.builder()
                .orderId(String.valueOf(order.getId()))
                .userId(order.getUserId())
                .amount(order.getTotalAmount())
                .currency("INR")
                .method(method)
                .status(Payment.PaymentStatus.INITIATED)
                .build();

        payment = paymentRepository.save(payment);

        // Simulate payment processing
        if (method == Payment.PaymentMethod.COD) {
            // COD doesn't require immediate payment
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            order.setPaymentStatus(Order.PaymentStatus.PENDING);
            order.setStatus(Order.OrderStatus.CONFIRMED);
        } else if ("RAZORPAY".equalsIgnoreCase(paymentMethod)) {
            // Razorpay online payment will be completed after gateway verification
            payment.setStatus(Payment.PaymentStatus.INITIATED);
            order.setPaymentStatus(Order.PaymentStatus.PENDING);
            order.setStatus(Order.OrderStatus.PENDING);
        } else {
            // Simulate successful payment for other methods
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionId(generateTransactionId());

            if (method == Payment.PaymentMethod.CREDIT_CARD ||
                    method == Payment.PaymentMethod.DEBIT_CARD) {
                payment.setCardLast4("4242"); // Dummy card
                payment.setCardBrand("VISA");
            }

            order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
            order.setStatus(Order.OrderStatus.CONFIRMED);
        }

        order.setPaymentId(String.valueOf(payment.getId()));
        orderRepository.save(order);

        payment = paymentRepository.save(payment);

        // Send payment success email for online payments
        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS && method != Payment.PaymentMethod.COD) {
            mailService.sendPaymentSuccessEmail(order.getUserEmail(), order.getUserName(),
                    order.getTotalAmount().doubleValue(), order.getOrderNumber());
        }

        return payment;
    }

    public Payment createRazorpayOrder(Order order) throws RazorpayException {
        String rzpOrderId;
        int amountInPaise = order.getTotalAmount().multiply(new BigDecimal("100")).intValue();

        if (razorpayClient != null) {
            try {
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountInPaise);
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", order.getOrderNumber());
                com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
                rzpOrderId = razorpayOrder.get("id");
            } catch (Exception e) {
                rzpOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            }
        } else {
            rzpOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        }

        Payment payment = null;
        if (order.getPaymentId() != null && !order.getPaymentId().isBlank()) {
            try {
                payment = paymentRepository.findById(Long.parseLong(order.getPaymentId())).orElse(null);
            } catch (NumberFormatException ignored) {
            }
        }

        if (payment == null) {
            payment = Payment.builder()
                    .orderId(String.valueOf(order.getId()))
                    .userId(order.getUserId())
                    .amount(order.getTotalAmount())
                    .currency("INR")
                    .method(Payment.PaymentMethod.UPI)
                    .status(Payment.PaymentStatus.INITIATED)
                    .razorpayOrderId(rzpOrderId)
                    .build();
        } else {
            payment.setRazorpayOrderId(rzpOrderId);
            payment.setMethod(Payment.PaymentMethod.UPI);
            payment.setStatus(Payment.PaymentStatus.INITIATED);
        }

        payment = paymentRepository.save(payment);

        order.setPaymentId(String.valueOf(payment.getId()));
        orderRepository.save(order);

        return payment;
    }

    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);

            return Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
        } catch (Exception e) {
            return false;
        }
    }

    public void completePayment(String paymentId, String transactionId, String method) {
        Payment payment = paymentRepository.findById(Long.parseLong(paymentId))
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setTransactionId(transactionId);
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setMethod(parsePaymentMethod(method));
        payment.setCompletedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Order order = orderRepository.findById(Long.parseLong(payment.getOrderId()))
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
        order.setStatus(Order.OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Send payment success email
        mailService.sendPaymentSuccessEmail(order.getUserEmail(), order.getUserName(),
                order.getTotalAmount().doubleValue(), order.getOrderNumber());
    }

    private Payment.PaymentMethod parsePaymentMethod(String method) {
        try {
            return Payment.PaymentMethod.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Payment.PaymentMethod.COD; // Default to COD
        }
    }

    private String generateTransactionId() {
        return "TXN" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }

    public org.springframework.data.domain.Page<Payment> getAllPayments(
            org.springframework.data.domain.Pageable pageable) {
        return paymentRepository.findAll(pageable);
    }
}
