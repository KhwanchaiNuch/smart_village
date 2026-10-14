package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_bill")
@Data
public class WaterBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bill_id")
    private Long billId;

    @Column(name = "household_id", nullable = false)
    private Integer householdId;

    @Column(name = "village_id")
    private Integer villageId;

    @Column(name = "billing_period", nullable = false)
    private LocalDate billingPeriod;

    @Column(name = "meter_no", length = 50)
    private String meterNo;

    @Column(name = "previous_reading", precision = 12, scale = 2, nullable = false)
    private BigDecimal previousReading = BigDecimal.ZERO;

    @Column(name = "current_reading", precision = 12, scale = 2, nullable = false)
    private BigDecimal currentReading;

    @Column(name = "units_used", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitsUsed;

    @Column(name = "rate_per_unit", precision = 10, scale = 2, nullable = false)
    private BigDecimal ratePerUnit;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "invoice_no", length = 50, unique = true)
    private String invoiceNo;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false, length = 20)
    private String status = "UNPAID";

    private String remark;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    // ระบุ getter/setter เอง เพราะ Lombok annotation processing ไม่ทำงานในบางสภาพแวดล้อม build
    public Long getBillId() { return billId; }
    public void setBillId(Long billId) { this.billId = billId; }

    public Integer getHouseholdId() { return householdId; }
    public void setHouseholdId(Integer householdId) { this.householdId = householdId; }

    public Integer getVillageId() { return villageId; }
    public void setVillageId(Integer villageId) { this.villageId = villageId; }

    public LocalDate getBillingPeriod() { return billingPeriod; }
    public void setBillingPeriod(LocalDate billingPeriod) { this.billingPeriod = billingPeriod; }

    public String getMeterNo() { return meterNo; }
    public void setMeterNo(String meterNo) { this.meterNo = meterNo; }

    public BigDecimal getPreviousReading() { return previousReading; }
    public void setPreviousReading(BigDecimal previousReading) { this.previousReading = previousReading; }

    public BigDecimal getCurrentReading() { return currentReading; }
    public void setCurrentReading(BigDecimal currentReading) { this.currentReading = currentReading; }

    public BigDecimal getUnitsUsed() { return unitsUsed; }
    public void setUnitsUsed(BigDecimal unitsUsed) { this.unitsUsed = unitsUsed; }

    public BigDecimal getRatePerUnit() { return ratePerUnit; }
    public void setRatePerUnit(BigDecimal ratePerUnit) { this.ratePerUnit = ratePerUnit; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }

    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
