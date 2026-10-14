package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_payment")
@Data
public class WaterPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "bill_id", nullable = false)
    private Long billId;

    @Column(name = "receipt_no", length = 50, unique = true)
    private String receiptNo;

    @Column(name = "paid_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal paidAmount;

    @Column(name = "paid_date", nullable = false)
    private LocalDate paidDate;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "received_by")
    private Long receivedBy;

    private String remark;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    // ระบุ getter/setter เอง เพราะ Lombok annotation processing ไม่ทำงานในบางสภาพแวดล้อม build
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public Long getBillId() { return billId; }
    public void setBillId(Long billId) { this.billId = billId; }

    public String getReceiptNo() { return receiptNo; }
    public void setReceiptNo(String receiptNo) { this.receiptNo = receiptNo; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Long getReceivedBy() { return receivedBy; }
    public void setReceivedBy(Long receivedBy) { this.receivedBy = receivedBy; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
