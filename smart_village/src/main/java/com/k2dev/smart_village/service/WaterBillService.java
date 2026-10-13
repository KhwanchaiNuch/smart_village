package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.AppUser;
import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.WaterBill;
import com.k2dev.smart_village.entity.WaterPayment;
import com.k2dev.smart_village.repository.AppUserRepository;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.WaterBillRepository;
import com.k2dev.smart_village.repository.WaterPaymentRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WaterBillService {

    @Autowired private WaterBillRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;
    @Autowired private WaterRateSettingService rateService;
    @Autowired private AppUserRepository appUserRepo;
    @Autowired private WaterPaymentRepository paymentRepo;

    /** userId ของผู้ใช้ที่ login อยู่ตอนนี้ (null ถ้าหาไม่เจอ) — ใช้บันทึกว่าใครเป็นคนออกบิล */
    private Long currentUserId() {
        UserPrincipal principal = ScopeUtil.currentUser();
        if (principal == null) return null;
        AppUser u = appUserRepo.findByUsername(principal.getUsername()).orElse(null);
        return u != null ? u.getUserId().longValue() : null;
    }

    private boolean householdOwned(Integer householdId) {
        if (householdId == null) return false;
        Household hh = householdRepo.findById(householdId).orElse(null);
        return hh != null && geoScope.inScopeByVillage(hh.getVillageId());
    }

    /** ยอดที่ชำระมาแล้วสะสมของบิลนี้ (รวมทุกงวดการชำระย่อย) */
    public BigDecimal amountPaidFor(Long billId) {
        BigDecimal total = BigDecimal.ZERO;
        for (WaterPayment p : paymentRepo.findByBillId(billId)) total = total.add(p.getPaidAmount());
        return total;
    }

    private Map<String, Object> enrichOne(WaterBill b) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("billId", b.getBillId());
        row.put("householdId", b.getHouseholdId());
        row.put("villageId", b.getVillageId());
        row.put("billingPeriod", b.getBillingPeriod());
        row.put("meterNo", b.getMeterNo());
        row.put("previousReading", b.getPreviousReading());
        row.put("currentReading", b.getCurrentReading());
        row.put("unitsUsed", b.getUnitsUsed());
        row.put("ratePerUnit", b.getRatePerUnit());
        row.put("amount", b.getAmount());
        row.put("invoiceNo", b.getInvoiceNo());
        row.put("invoiceDate", b.getInvoiceDate());
        row.put("dueDate", b.getDueDate());
        row.put("status", b.getStatus());
        row.put("remark", b.getRemark());
        row.put("createdAt", b.getCreatedAt());
        BigDecimal amountPaid = "PAID".equals(b.getStatus()) ? b.getAmount() : amountPaidFor(b.getBillId());
        BigDecimal balance = b.getAmount().subtract(amountPaid);
        row.put("amountPaid", amountPaid);
        row.put("balance", balance);
        boolean overdue = !"PAID".equals(b.getStatus()) && b.getDueDate() != null && b.getDueDate().isBefore(LocalDate.now());
        row.put("overdue", overdue);
        Household hh = b.getHouseholdId() != null ? householdRepo.findById(b.getHouseholdId()).orElse(null) : null;
        row.put("houseNo", hh != null ? hh.getHouseNo() : null);
        row.put("moo", hh != null ? hh.getMoo() : null);
        return row;
    }

    private List<Map<String, Object>> enrich(List<WaterBill> items) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (WaterBill b : items) result.add(enrichOne(b));
        return result;
    }

    private static LocalDate parsePeriod(String period) {
        if (period == null || period.isBlank()) return null;
        try {
            String[] parts = period.split("-");
            int y = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            return LocalDate.of(y, m, 1);
        } catch (Exception ex) {
            return null;
        }
    }

    /** รายการบิลดิบ (ยังไม่ enrich) ตาม scope ของ user ปัจจุบัน — period = null คือทุกงวด */
    private List<WaterBill> rawList(Integer villageId, String period) {
        LocalDate periodDate = parsePeriod(period);
        if (villageId != null) {
            return periodDate != null
                    ? repo.findByVillageIdAndBillingPeriod(villageId, periodDate)
                    : repo.findByVillageId(villageId);
        } else if (ScopeUtil.isAdmin()) {
            return periodDate != null ? repo.findByBillingPeriod(periodDate) : repo.findAll();
        } else {
            List<Integer> vids = geoScope.getVillageIds();
            if (vids == null) {
                return periodDate != null ? repo.findByBillingPeriod(periodDate) : repo.findAll();
            } else if (vids.isEmpty()) {
                return List.of();
            } else {
                return periodDate != null
                        ? repo.findByVillageIdInAndBillingPeriod(vids, periodDate)
                        : repo.findByVillageIdIn(vids);
            }
        }
    }

    public List<Map<String, Object>> list(Integer villageId, String period) {
        return enrich(rawList(villageId, period));
    }

    public ResponseEntity<?> get(Long id) {
        WaterBill b = repo.findById(id).orElse(null);
        if (b == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (!ScopeUtil.isAdmin() && !householdOwned(b.getHouseholdId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(enrichOne(b));
    }

    public ResponseEntity<?> getLastReading(Integer householdId) {
        BigDecimal last = repo.findTopByHouseholdIdOrderByBillingPeriodDesc(householdId)
                .map(WaterBill::getCurrentReading)
                .orElse(BigDecimal.ZERO);
        return ResponseEntity.ok(Map.of("previousReading", last));
    }

    public List<Map<String, Object>> pendingHouseholds(Integer villageId, String period) {
        LocalDate periodDate = parsePeriod(period);
        if (periodDate == null) return List.of();
        List<Household> households;
        if (villageId != null) {
            households = householdRepo.findByVillageId(villageId);
        } else if (ScopeUtil.isAdmin()) {
            households = householdRepo.findAll();
        } else {
            List<Integer> vids = geoScope.getVillageIds();
            households = vids == null ? householdRepo.findAll()
                    : (vids.isEmpty() ? List.of() : householdRepo.findByVillageIdIn(vids));
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Household h : households) {
            if (!repo.existsByHouseholdIdAndBillingPeriod(h.getHouseholdId(), periodDate)) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("householdId", h.getHouseholdId());
                row.put("houseNo", h.getHouseNo());
                row.put("moo", h.getMoo());
                BigDecimal last = repo.findTopByHouseholdIdOrderByBillingPeriodDesc(h.getHouseholdId())
                        .map(WaterBill::getCurrentReading).orElse(BigDecimal.ZERO);
                row.put("previousReading", last);
                result.add(row);
            }
        }
        return result;
    }

    public ResponseEntity<?> add(WaterBill b) {
        try {
            if (b.getHouseholdId() == null) return ResponseEntity.status(400).body(Map.of("message", "กรุณาเลือกครัวเรือน"));
            if (b.getBillingPeriod() == null) return ResponseEntity.status(400).body(Map.of("message", "กรุณาระบุงวดเดือน"));
            if (b.getCurrentReading() == null) return ResponseEntity.status(400).body(Map.of("message", "กรุณาระบุเลขมิเตอร์ปัจจุบัน"));

            Household hh = householdRepo.findById(b.getHouseholdId()).orElse(null);
            if (hh == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือน"));
            if (!ScopeUtil.isAdmin() && !geoScope.inScopeByVillage(hh.getVillageId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มบิลให้ครัวเรือนของหมู่บ้านอื่น"));

            LocalDate billingPeriod = b.getBillingPeriod().withDayOfMonth(1);
            if (repo.existsByHouseholdIdAndBillingPeriod(b.getHouseholdId(), billingPeriod))
                return ResponseEntity.status(400).body(Map.of("message", "ครัวเรือนนี้มีบิลของงวดเดือนนี้อยู่แล้ว"));

            BigDecimal previousReading = repo.findTopByHouseholdIdOrderByBillingPeriodDesc(b.getHouseholdId())
                    .map(WaterBill::getCurrentReading).orElse(BigDecimal.ZERO);
            if (b.getCurrentReading().compareTo(previousReading) < 0)
                return ResponseEntity.status(400).body(Map.of("message", "เลขมิเตอร์ปัจจุบันต้องไม่น้อยกว่าเลขมิเตอร์ครั้งก่อน (" + previousReading + ")"));

            BigDecimal rate = rateService.getCurrentRate(hh.getVillageId(), billingPeriod);
            if (rate == null) return ResponseEntity.status(400).body(Map.of("message", "ยังไม่ได้ตั้งค่าอัตราค่าน้ำ กรุณาตั้งค่าอัตราค่าน้ำก่อน"));

            BigDecimal units = b.getCurrentReading().subtract(previousReading);
            BigDecimal amount = units.multiply(rate).setScale(2, RoundingMode.HALF_UP);

            b.setVillageId(hh.getVillageId());
            b.setBillingPeriod(billingPeriod);
            b.setPreviousReading(previousReading);
            b.setUnitsUsed(units);
            b.setRatePerUnit(rate);
            b.setAmount(amount);
            b.setStatus("UNPAID");
            b.setInvoiceDate(b.getInvoiceDate() != null ? b.getInvoiceDate() : LocalDate.now());
            b.setDueDate(b.getDueDate() != null ? b.getDueDate() : billingPeriod.plusDays(20));
            b.setCreatedBy(currentUserId());

            WaterBill saved = repo.save(b);
            long seq = repo.countByVillageIdAndBillingPeriod(saved.getVillageId(), billingPeriod);
            saved.setInvoiceNo("INV-V" + (saved.getVillageId() != null ? saved.getVillageId() : 0)
                    + "-" + billingPeriod.format(DateTimeFormatter.ofPattern("yyyyMM"))
                    + "-" + String.format("%04d", seq));
            saved = repo.save(saved);
            return ResponseEntity.ok(enrichOne(saved));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    /** ออกบิลหลายรายการพร้อมกัน (เช่นทั้งหมู่บ้านในคราวเดียว) — ใช้ตรรกะเดียวกับ add() ทีละรายการ ไม่ล้มทั้งชุดถ้าบางรายการพัง */
    public List<Map<String, Object>> addBulk(List<WaterBill> items) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (items == null) return results;
        for (WaterBill item : items) {
            Integer householdId = item.getHouseholdId();
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("householdId", householdId);
            try {
                ResponseEntity<?> resp = add(item);
                boolean ok = resp.getStatusCode().is2xxSuccessful();
                row.put("success", ok);
                if (ok) {
                    row.put("bill", resp.getBody());
                } else {
                    Object body = resp.getBody();
                    String msg = "เกิดข้อผิดพลาด";
                    if (body instanceof Map<?, ?> m && m.get("message") != null) msg = String.valueOf(m.get("message"));
                    row.put("message", msg);
                }
            } catch (Exception ex) {
                row.put("success", false);
                row.put("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด");
            }
            results.add(row);
        }
        return results;
    }

    public ResponseEntity<?> edit(WaterBill b) {
        try {
            WaterBill existing = repo.findById(b.getBillId()).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (!ScopeUtil.isAdmin() && !householdOwned(existing.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขบิลของหมู่บ้านอื่น"));
            if (!"UNPAID".equals(existing.getStatus()))
                return ResponseEntity.status(400).body(Map.of("message", "แก้ไขได้เฉพาะบิลที่ยังไม่ชำระ"));

            BigDecimal currentReading = b.getCurrentReading() != null ? b.getCurrentReading() : existing.getCurrentReading();
            if (currentReading.compareTo(existing.getPreviousReading()) < 0)
                return ResponseEntity.status(400).body(Map.of("message", "เลขมิเตอร์ปัจจุบันต้องไม่น้อยกว่าเลขมิเตอร์ครั้งก่อน (" + existing.getPreviousReading() + ")"));

            BigDecimal units = currentReading.subtract(existing.getPreviousReading());
            BigDecimal amount = units.multiply(existing.getRatePerUnit()).setScale(2, RoundingMode.HALF_UP);

            existing.setCurrentReading(currentReading);
            existing.setUnitsUsed(units);
            existing.setAmount(amount);
            if (b.getMeterNo() != null) existing.setMeterNo(b.getMeterNo());
            if (b.getRemark() != null) existing.setRemark(b.getRemark());
            if (b.getDueDate() != null) existing.setDueDate(b.getDueDate());

            return ResponseEntity.ok(enrichOne(repo.save(existing)));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> delete(Long id) {
        try {
            WaterBill existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (!ScopeUtil.isAdmin() && !householdOwned(existing.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบบิลของหมู่บ้านอื่น"));
            if (!"UNPAID".equals(existing.getStatus()))
                return ResponseEntity.status(400).body(Map.of("message", "ลบได้เฉพาะบิลที่ยังไม่ชำระ"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    /** ประวัติบิล/การใช้น้ำทั้งหมดของครัวเรือนเดียว ทุกงวด */
    public ResponseEntity<?> byHousehold(Integer householdId) {
        Household hh = householdRepo.findById(householdId).orElse(null);
        if (hh == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือน"));
        if (!ScopeUtil.isAdmin() && !geoScope.inScopeByVillage(hh.getVillageId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลของหมู่บ้านอื่น"));

        List<WaterBill> bills = new ArrayList<>(repo.findByHouseholdId(householdId));
        bills.sort(Comparator.comparing(WaterBill::getBillingPeriod).reversed());
        List<Map<String, Object>> rows = enrich(bills);

        BigDecimal totalBilled = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;
        for (Map<String, Object> r : rows) {
            totalBilled = totalBilled.add((BigDecimal) r.get("amount"));
            totalPaid = totalPaid.add((BigDecimal) r.get("amountPaid"));
        }

        Map<String, Object> household = new LinkedHashMap<>();
        household.put("householdId", hh.getHouseholdId());
        household.put("houseNo", hh.getHouseNo());
        household.put("moo", hh.getMoo());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("household", household);
        result.put("bills", rows);
        result.put("totalBilled", totalBilled);
        result.put("totalPaid", totalPaid);
        result.put("totalOutstanding", totalBilled.subtract(totalPaid));
        return ResponseEntity.ok(result);
    }

    /** สรุปยอดของงวดเดือนที่ระบุ (ถ้ามี) + ยอดค้างชำระสะสมทุกงวดของ scope นี้ */
    public Map<String, Object> summary(Integer villageId, String period) {
        List<WaterBill> periodBills = (period != null && !period.isBlank()) ? rawList(villageId, period) : List.of();
        BigDecimal periodTotalAmount = BigDecimal.ZERO;
        BigDecimal periodPaidAmount = BigDecimal.ZERO;
        BigDecimal periodUnpaidAmount = BigDecimal.ZERO;
        BigDecimal periodOverdueAmount = BigDecimal.ZERO;
        int periodPaidCount = 0, periodUnpaidCount = 0, periodOverdueCount = 0;
        List<Map<String, Object>> outstandingRows = new ArrayList<>();

        for (WaterBill b : periodBills) {
            periodTotalAmount = periodTotalAmount.add(b.getAmount());
            Map<String, Object> row = enrichOne(b);
            boolean paid = "PAID".equals(b.getStatus());
            BigDecimal balance = (BigDecimal) row.get("balance");
            boolean overdue = (Boolean) row.get("overdue");
            if (paid) {
                periodPaidCount++;
                periodPaidAmount = periodPaidAmount.add(b.getAmount());
            } else {
                periodUnpaidCount++;
                periodUnpaidAmount = periodUnpaidAmount.add(balance);
                outstandingRows.add(row);
                if (overdue) {
                    periodOverdueCount++;
                    periodOverdueAmount = periodOverdueAmount.add(balance);
                }
            }
        }

        List<WaterBill> allBills = rawList(villageId, null);
        BigDecimal overallOutstandingAmount = BigDecimal.ZERO;
        int overallOutstandingCount = 0;
        for (WaterBill b : allBills) {
            if (!"PAID".equals(b.getStatus())) {
                overallOutstandingCount++;
                overallOutstandingAmount = overallOutstandingAmount.add(b.getAmount().subtract(amountPaidFor(b.getBillId())));
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("period", period);
        result.put("periodTotalBills", periodBills.size());
        result.put("periodTotalAmount", periodTotalAmount);
        result.put("periodPaidCount", periodPaidCount);
        result.put("periodPaidAmount", periodPaidAmount);
        result.put("periodUnpaidCount", periodUnpaidCount);
        result.put("periodUnpaidAmount", periodUnpaidAmount);
        result.put("periodOverdueCount", periodOverdueCount);
        result.put("periodOverdueAmount", periodOverdueAmount);
        result.put("overallOutstandingCount", overallOutstandingCount);
        result.put("overallOutstandingAmount", overallOutstandingAmount);
        result.put("outstandingBills", outstandingRows);
        return result;
    }

    public WaterBill findEntity(Long id) { return repo.findById(id).orElse(null); }
    public WaterBill save(WaterBill b) { return repo.save(b); }
    public Map<String, Object> toRow(WaterBill b) { return enrichOne(b); }

    /** ใช้โดย WaterPaymentService เพื่อนับเลขที่ใบเสร็จแยกอิสระตามหมู่บ้าน */
    public List<Long> billIdsForVillage(Integer villageId) {
        List<Long> ids = new ArrayList<>();
        for (WaterBill b : repo.findByVillageId(villageId)) ids.add(b.getBillId());
        return ids;
    }
}
