-- ============================================================
-- SQL MOCKUP DATA — สำหรับหมู่บ้านเป้าหมาย (Tambon ID = 100101)
-- ใช้สำหรับแสดงผลให้ผู้ใช้ระดับ TAMBON (สิทธิ์กำนัน) เห็นข้อมูลจำลองครอบคลุมทุกเมนู
-- ============================================================

DO $$
DECLARE
  v_id INT;
  hh1 INT; hh2 INT; hh3 INT; hh4 INT; hh5 INT;
  p1 INT; p2 INT; p3 INT; p4 INT; p5 INT; p6 INT; p7 INT;
BEGIN

  -- 1. ล้างข้อมูลจำลองเดิมเฉพาะของเขตนี้เพื่อความสะอาดของข้อมูล (หากมี)
  DELETE FROM community_issue WHERE village_id IN (SELECT village_id FROM village WHERE tambon_id = 100101);
  DELETE FROM visit_log WHERE person_id IN (SELECT person_id FROM person p JOIN household h ON p.household_id = h.household_id WHERE h.village_id IN (SELECT village_id FROM village WHERE tambon_id = 100101));
  DELETE FROM person_skill WHERE person_id IN (SELECT person_id FROM person p JOIN household h ON p.household_id = h.household_id WHERE h.village_id IN (SELECT village_id FROM village WHERE tambon_id = 100101));
  DELETE FROM person WHERE household_id IN (SELECT household_id FROM household WHERE village_id IN (SELECT village_id FROM village WHERE tambon_id = 100101));
  DELETE FROM household_economic WHERE household_id IN (SELECT household_id FROM household WHERE village_id IN (SELECT village_id FROM village WHERE tambon_id = 100101));
  DELETE FROM household WHERE village_id IN (SELECT village_id FROM village WHERE tambon_id = 100101);
  DELETE FROM village_need_survey WHERE village_id IN (SELECT village_id FROM village WHERE tambon_id = 100101);
  DELETE FROM village_resource WHERE village_id IN (SELECT village_id FROM village WHERE tambon_id = 100101);
  DELETE FROM village WHERE tambon_id = 100101;

  -- 2. สร้างข้อมูลหมู่บ้านใหม่ระดับตำบล 100101 (พระบรมมหาราชวัง)
  -- สมมติให้ หมู่บ้านไอดี 1001 คือ "หมู่บ้านพระราชวังต้นแบบ"
  INSERT INTO village (village_id, village_name, moo, tambon_id)
  VALUES (1001, 'หมู่บ้านพระราชวังต้นแบบ', '1', 100101)
  RETURNING village_id INTO v_id;

  -- 3. ทรัพยากรหมู่บ้าน (Village Resources)
  INSERT INTO village_resource (village_id, resource_name, resource_type, quantity, unit, status, description, location_lat, location_lng) VALUES
  (v_id, 'ศาลากลางอเนกประสงค์หมู่ 1', 'อาคาร/สิ่งก่อสร้าง', 1, 'หลัง', 'พร้อมใช้งาน', 'ศาลากลางจัดกิจกรรมและประชุมหมู่บ้าน', 13.7512, 100.4912),
  (v_id, 'บ่อน้ำบาดาลส่วนรวม', 'แหล่งน้ำ', 2, 'แห่ง', 'พร้อมใช้งาน', 'แหล่งน้ำอุปโภคบริโภคสำรองยามแล้ง', 13.7520, 100.4905),
  (v_id, 'ชุดแผงโซลาร์เซลล์ส่องสว่างหมู่บ้าน', 'พลังงาน', 15, 'ชุด', 'พร้อมใช้งาน', 'ไฟส่องสว่างทางเดินพลังงานแสงอาทิตย์', 13.7505, 100.4920),
  (v_id, 'รถพยาบาลฉุกเฉินชุมชน', 'ยานพาหนะ', 1, 'คัน', 'ปรับปรุง/ซ่อมแซม', 'รถส่งตัวผู้ป่วยฉุกเฉินของหมู่บ้าน', 13.7510, 100.4910);

  -- 4. การสำรวจความต้องการของหมู่บ้าน (Village Need Surveys)
  INSERT INTO village_need_survey (village_id, survey_title, description, respondent_count, status, priority_level) VALUES
  (v_id, 'สำรวจความต้องการปรับปรุงระบบระบายน้ำเสีย', 'ต้องการท่อระบายน้ำคอนกรีตบริเวณซอยฝั่งทิศตะวันออกเพื่อแก้ปัญหาน้ำท่วมขังข้ามคืน', 45, 'เสนอโครงการแล้ว', 'สูงมาก'),
  (v_id, 'โครงการพัฒนาอาชีพผู้สูงอายุและแม่บ้าน', 'ความต้องการเรียนหลักสูตรทำอาหารแปรรูปและงานฝีมือเพื่อเสริมสร้างรายได้ให้ครัวเรือน', 28, 'รอดำเนินการ', 'ปานกลาง'),
  (v_id, 'สำรวจจุดติดตั้งกล้องวงจรปิด CCTV เสริมสร้างความปลอดภัย', 'ต้องการกล้องวงจรปิดรอบจุดเสี่ยงทางเข้าออกของหมู่บ้านเพิ่มเติม', 60, 'กำลังดำเนินการ', 'สูง');

  -- 5. ครัวเรือน (Households) - 5 ครัวเรือนเพื่อจำลองมิติต่างๆ
  INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
  VALUES (v_id, '101/1', '1', 13.7515, 100.4922, 'ดี', 'ระบบประปา', true, true, 'บ้านผู้ใหญ่บ้าน')
  RETURNING household_id INTO hh1;

  INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
  VALUES (v_id, '101/2', '1', 13.7521, 100.4915, 'ปานกลาง', 'ระบบประปา', true, true, '')
  RETURNING household_id INTO hh2;

  INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
  VALUES (v_id, '101/3', '1', 13.7508, 100.4908, 'ทรุดโทรม', 'น้ำบาดาล', false, true, 'ต้องการงบปรับปรุงฝาบ้าน')
  RETURNING household_id INTO hh3;

  INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
  VALUES (v_id, '101/4', '1', 13.7511, 100.4929, 'ดี', 'ระบบประปา', false, true, '')
  RETURNING household_id INTO hh4;

  INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
  VALUES (v_id, '101/5', '1', 13.7525, 100.4935, 'ดี', 'ระบบประปา', true, true, 'บ้านผู้ป่วยติดเตียง')
  RETURNING household_id INTO hh5;

  -- 6. ข้อมูลเศรษฐกิจครัวเรือน (Household Economics)
  INSERT INTO household_economic (household_id, average_income_per_month, average_expense_per_month, main_occupation, secondary_occupation, has_debt, debt_amount, source_of_debt, agricultural_land_area, land_ownership_status) VALUES
  (hh1, 45000.00, 32000.00, 'รับราชการ', 'ค้าขายออนไลน์', false, 0.00, 'ไม่มีหนี้สิน', 0.0, 'โฉนดที่ดินตนเอง'),
  (hh2, 18000.00, 16500.00, 'รับจ้างทั่วไป', 'รับจ้างเย็บผ้า', true, 25000.00, 'หนี้นอกระบบ', 0.0, 'เช่าอาศัย'),
  (hh3, 8500.00, 9000.00, 'ผู้รับเบี้ยยังชีพ/เกษตรกร', 'ไม่มี', true, 80000.00, 'ธ.ก.ส.', 2.5, 'ที่ทำกินไม่มีโฉนด'),
  (hh4, 25000.00, 18000.00, 'พนักงานบริษัท', 'ทำสวนผลไม้ครัวเรือน', false, 0.00, 'ไม่มีหนี้สิน', 1.0, 'ส.ป.ก.'),
  (hh5, 12000.00, 13000.00, 'ค้าขายในตลาด', 'ไม่มี', true, 50000.00, 'กองทุนหมู่บ้าน', 0.0, 'โฉนดที่ดินตนเอง');

  -- 7. บุคคลในชุมชน (Persons)
  -- ครัวเรือน hh1 (ผู้ใหญ่บ้าน ครอบครัวอบอุ่น)
  INSERT INTO person (household_id, first_name, last_name, gender, age, birth_date, is_elderly, is_disabled, is_bedridden, is_sick, welfare_card, income_per_month, occupation, is_registered_in_village, is_living_in_village, created_at)
  VALUES (hh1, 'สมศักดิ์', 'รักดี', 'ชาย', 52, '1974-05-12', false, false, false, false, false, 28000.00, 'ผู้ใหญ่บ้าน/รับราชการ', true, true, NOW())
  RETURNING person_id INTO p1;

  INSERT INTO person (household_id, first_name, last_name, gender, age, birth_date, is_elderly, is_disabled, is_bedridden, is_sick, welfare_card, income_per_month, occupation, is_registered_in_village, is_living_in_village, created_at)
  VALUES (hh1, 'วรรณพร', 'รักดี', 'หญิง', 48, '1978-08-20', false, false, false, false, false, 17000.00, 'ค้าขาย', true, true, NOW())
  RETURNING person_id INTO p2;

  -- ครัวเรือน hh2 (กลุ่มแรงงานฝีมือช่าง)
  INSERT INTO person (household_id, first_name, last_name, gender, age, birth_date, is_elderly, is_disabled, is_bedridden, is_sick, welfare_card, income_per_month, occupation, is_registered_in_village, is_living_in_village, created_at)
  VALUES (hh2, 'มานะ', 'ก่อสร้าง', 'ชาย', 38, '1988-02-15', false, false, false, false, false, 18000.00, 'ช่างปูน/รับจ้างทั่วไป', true, true, NOW())
  RETURNING person_id INTO p3;

  -- ครัวเรือน hh3 (กลุ่มสูงอายุ/บัตรสวัสดิการรัฐ)
  INSERT INTO person (household_id, first_name, last_name, gender, age, birth_date, is_elderly, is_disabled, is_bedridden, is_sick, welfare_card, income_per_month, occupation, is_registered_in_village, is_living_in_village, created_at)
  VALUES (hh3, 'ยายทองคำ', 'แสนดี', 'หญิง', 76, '1950-10-10', true, false, false, false, true, 800.00, 'ไม่มีอาชีพ/รับเบี้ยผู้สูงอายุ', true, true, NOW())
  RETURNING person_id INTO p4;

  -- ครัวเรือน hh4 (กลุ่มวัยรุ่นศึกษา/คนทำงานบริษัท)
  INSERT INTO person (household_id, first_name, last_name, gender, age, birth_date, is_elderly, is_disabled, is_bedridden, is_sick, welfare_card, income_per_month, occupation, is_registered_in_village, is_living_in_village, created_at)
  VALUES (hh4, 'เกียรติศักดิ์', 'เจริญศิริ', 'ชาย', 25, '2001-11-30', false, false, false, false, false, 25000.00, 'พนักงานบริษัทไอที', true, true, NOW())
  RETURNING person_id INTO p5;

  -- ครัวเรือน hh5 (กลุ่มเปราะบาง สุขภาพเตียง/พิการ)
  INSERT INTO person (household_id, first_name, last_name, gender, age, birth_date, is_elderly, is_disabled, is_bedridden, is_sick, welfare_card, income_per_month, occupation, is_registered_in_village, is_living_in_village, created_at)
  VALUES (hh5, 'สมใจ', 'มีพร้อม', 'หญิง', 65, '1961-04-05', true, true, true, true, true, 1000.00, 'ไม่มีอาชีพ', true, true, NOW())
  RETURNING person_id INTO p6;

  INSERT INTO person (household_id, first_name, last_name, gender, age, birth_date, is_elderly, is_disabled, is_bedridden, is_sick, welfare_card, income_per_month, occupation, is_registered_in_village, is_living_in_village, created_at)
  VALUES (hh5, 'ประเสริฐ', 'มีพร้อม', 'ชาย', 68, '1958-09-12', true, false, false, false, false, 8000.00, 'ค้าขายขนาดเล็ก', true, true, NOW())
  RETURNING person_id INTO p7;

  -- 8. ทักษะบุคคล (Person Skills)
  INSERT INTO person_skill (person_id, skill_name, skill_category, skill_level, description) VALUES
  (p1, 'การประสานงานส่วนท้องถิ่นและการปกครอง', 'การบริหารจัดการ', 'ผู้เชี่ยวชาญ/วิทยากร', 'มีความรู้ด้านระเบียบการจัดทำแผนพัฒนาชุมชนและกฎหมายปกครองเบื้องต้น'),
  (p2, 'การแปรรูปอาหารและถนอมอาหาร', 'อาหารและเบเกอรี่', 'ชำนาญการ', 'สามารถทำน้ำพริกแกงแปรรูปและผลไม้อบแห้งระดับวิสาหกิจชุมชน'),
  (p3, 'งานก่อสร้างโครงสร้างเหล็กและปูน', 'งานช่าง/วิศวกรรม', 'ชำนาญการ', 'รับเหมาโครงหลังคา ผนังปูนสำเร็จรูป และงานตกแต่งภายในท้องถิ่น'),
  (p5, 'การเขียนโปรแกรมและการบำรุงรักษาคอมพิวเตอร์', 'เทคโนโลยีและคอมพิวเตอร์', 'ผู้เชี่ยวชาญ/วิทยากร', 'มีความรู้ในการเขียนเว็บ พัฒนาระบบชุมชน และซ่อมแซมระบบเน็ตเวิร์กเบื้องต้น');

  -- 9. บันทึกการเยี่ยมเยียนผู้ป่วยเปราะบาง (Visit Logs)
  INSERT INTO visit_log (person_id, visit_date, visitor_name, health_status, help_given, advice_given, remark) VALUES
  (p6, '2026-05-10', 'อสม. สมรักษ์ ดีเลิศ', 'ติดเตียง ร่างกายซีกซ้ายขยับเขยื้อนไม่ได้ ความดันโลหิตปกติ แผลกดทับดีขึ้น', 'มอบแผ่นรองซับและถุงยังชีพของหมู่บ้าน', 'แนะนำการพลิกตัวบ่อยๆ ทุก 2 ชั่วโมง เพื่อป้องกันแผลกดทับลุกลาม', 'คนไข้ยิ้มแย้มแจ่มใสขึ้น'),
  (p6, '2026-06-12', 'พยาบาลวิชาชีพ สุภาพร สีสว่าง', 'ติดเตียง อาการทั่วไปคงที่ ความดันปกติ ไม่มีไข้ ทานอาหารเหลวได้ดี', 'ทำความสะอาดสายยางให้อาหารและเปลี่ยนสายปัสสาวะ', 'แนะนำญาติเรื่องสุขวิทยาส่วนบุคคลและการจัดสภาพแวดล้อมห้องนอน', 'นัดหมายการตรวจติดตามผลอีก 1 เดือน');

  -- 10. ปัญหาของชุมชน (Community Issues)
  INSERT INTO community_issue (village_id, issue_title, description, severity, status, location_lat, location_lng, reporter_name, contact_info, assigned_dept, progress_notes) VALUES
  (v_id, 'ถนนปากซอยสามัคคี 1 ชำรุดเป็นหลุมลึก', 'ถนนคอนกรีตบริเวณปากซอยชำรุดเสียหายเป็นหลุมขนาดใหญ่ รถจักรยานยนต์ล้มบ่อยครั้งในช่วงค่ำคืน', 'สูง', 'รอดำเนินการ', 13.7518, 100.4925, 'สมศักดิ์ รักดี', '081-234-5678', 'สำนักกองช่าง อบต.', 'อยู่ระหว่างรออนุมัติงบประมาณซ่อมเร่งด่วน'),
  (v_id, 'ขยะตกค้างและกลิ่นเหม็นบริเวณจุดพักขยะส่วนกลาง', 'ถังขยะชำรุดและรถเก็บขยะเว้นการมาจัดเก็บเป็นเวลาหลายวันทำให้ขยะล้นและส่งกลิ่นเหม็นรบกวนบ้านเรือนใกล้เคียง', 'ปานกลาง', 'กำลังดำเนินการ', 13.7523, 100.4910, 'วรรณพร รักดี', '089-999-8888', 'งานสาธารณสุขและสิ่งแวดล้อม', 'จัดส่งถังขยะใบใหม่มาทดแทน และกำชับรอบรถขยะเข้าจัดเก็บทุกวันพุธและเสาร์'),
  (v_id, 'หลอดไฟทางเดินริมลำคลองดับ 3 จุด', 'ไฟทางเดินริมฝั่งคลองชำรุด ดับสนิททำให้ชาวบ้านเดินสัญจรอันตรายยามค่ำคืน เสี่ยงเกิดอาชญากรรม', 'สูง', 'แก้ไขแล้ว', 13.7503, 100.4905, 'ยายทองคำ แสนดี', '085-111-2222', 'กองงานช่างไฟฟ้า', 'ดำเนินการเปลี่ยนหลอดไฟ LED ขนาด 50W เรียบร้อยทั้ง 3 จุด สว่างพร้อมใช้งานแล้ว');

END $$;
