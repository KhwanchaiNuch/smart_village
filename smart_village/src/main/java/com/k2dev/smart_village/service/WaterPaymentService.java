package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.AppUser;
import com.k2dev.smart_village.entity.WaterBill;
import com.k2dev.smart_village.entity.WaterPayment;
import com.k2dev.smart_village.repository.AppUserRepository;
import com.k2dev.smart_village.repository.WaterPaymentRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WaterPaymentService {

    @Autowired private WaterPaymentRepository repo;
    @Autowired private WaterBillService billService;
    @Autowired private GeoScopeService geoScope;
    @Autowired private AppUserRepository appUserRepo;

    /** userId ของผู้ใช้ที่ login อยู่ตอนนี้ (null ถ้าหาไม่เจอ) — ใช้บันทึกว่าใครเป็นคนรับชำระ */
    private Long currentUserId() {
        UserPrincipal principal = ScopeUtil.currentUser();
        if (principal == null) return null;
        AppUser u = appUserRepo.findByUsername(principal.getUsername()).orElse(null);
        return u != null ? u.getUserId().longValue() : null;
    }

    private Map<String, Object> enrichOne(WaterPayment p) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("paymentId", p.getPaymentId());
        row.put("billId", p.getBillId());
        row.put("receiptNo", p.getReceiptNo());
        row.put("paidAmount", p.getPaidAmount());
        row.put("paidDate", p.getPaidDate());
        row.put("paymentMethod", p.getPaymentMethod());
        row.put("remark", p.getRemark());
        row.put("createdAt", p.getCreatedAt());
        WaterBill bill = billService.findEntity(p.getBillId());
        row.put("bill", bill != null ? billService.toRow(bill) : null);
        return row;
    }

    public List<Map<String, Object>> listByBill(Long billId) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (WaterPayment p : repo.findByBillId(billId)) result.add(enrichOne(p));
        return result;
    }

    public ResponseEntity<?> get(Long id) {
        WaterPayment p = repo.findById(id).orElse(null);
        if (p == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        return ResponseEntity.ok(enrichOne(p));
    }

    public ResponseEntity<?> pay(WaterPayment p) {
        try {
            if (p.getBillId() == null) return ResponseEntity.status(400).body(Map.of("message", "กรุณาระบุบิลที่จะชำระ"));
            WaterBill bill = billService.findEntity(p.getBillId());
            if (bill == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบบิล"));
            if (!ScopeUtil.isAdmin() && !geoScope.inScopeByVillage(bill.getVillageId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์บันทึกรับชำระบิลของหมู่บ้านอื่น"));
            if (!"UNPAID".equals(bill.getStatus()) && !"PARTIAL".equals(bill.getStatus()))
                return ResponseEntity.status(400).body(Map.of("message", "บิลนี้ถูกชำระครบแล้ว"));

            BigDecimal alreadyPaid = billService.amountPaidFor(bill.getBillId());
            BigDecimal remaining = bill.getAmount().subtract(alreadyPaid);

            if (p.getPaidAmount() == null) p.setPaidAmount(remaining);
            if (p.getPaidAmount().compareTo(BigDecimal.ZERO) <= 0)
                return ResponseEntity.status(400).body(Map.of("message", "จำนวนเงินที่ชำระต้องมากกว่า 0"));
            if (p.getPaidAmount().compareTo(remaining) > 0)
                return ResponseEntity.status(400).body(Map.of("message", "จำนวนเงินที่ชำระเกินยอดคงเหลือ (คงเหลือ " + remaining + " บาท)"));

            if (p.getPaidDate() == null) p.setPaidDate(LocalDate.now());
            p.setReceivedBy(currentUserId());

            WaterPayment saved = repo.save(p);
            List<Long> billIds = billService.billIdsForVillage(bill.getVillageId());
            long seq = repo.countByBillIdIn(billIds);
            saved.setReceiptNo("RCP-V" + (bill.getVillageId() != null ? bill.getVillageId() : 0)
                    + "-" + saved.getPaidDate().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                    + "-" + String.format("%04d", seq));
            saved = repo.save(saved);

            BigDecimal totalPaid = alreadyPaid.add(saved.getPaidAmount());
            bill.setStatus(totalPaid.compareTo(bill.getAmount()) >= 0 ? "PAID" : "PARTIAL");
            billService.save(bill);

            return ResponseEntity.ok(enrichOne(saved));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> voidPayment(Long id) {
        try {
            WaterPayment p = repo.findById(id).orElse(null);
            if (p == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            WaterBill bill = billService.findEntity(p.getBillId());
            repo.deleteById(id);
            if (bill != null) {
                BigDecimal remainingPaid = billService.amountPaidFor(bill.getBillId());
                if (remainingPaid.compareTo(BigDecimal.ZERO) <= 0) bill.setStatus("UNPAID");
                else if (remainingPaid.compareTo(bill.getAmount()) < 0) bill.setStatus("PARTIAL");
                else bill.setStatus("PAID");
                billService.save(bill);
            }
            return ResponseEntity.ok(Map.of("message", "ยกเลิกการชำระสำเร็จ"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
