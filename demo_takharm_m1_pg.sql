-- ============================================================
--  DEMO DATA — หมู่ที่ 1 ตำบลท่าข้าม อำเภอชนแดน จ.เพชรบูรณ์ 67150
--  (PostgreSQL / pgAdmin)
--  วิธีรัน: เปิด pgAdmin → เลือก database → Query Tool → paste ทั้งหมดนี้ → F5
-- ============================================================

DO $$
DECLARE
  v_province_id  INT;
  v_amphur_id    INT;
  v_tambon_id    INT;
  v_village_id   INT;

  hh1  INT; hh2  INT; hh3  INT; hh4  INT; hh5  INT;
  hh6  INT; hh7  INT; hh8  INT; hh9  INT; hh10 INT;
  hh11 INT; hh12 INT; hh13 INT; hh14 INT; hh15 INT;
  hh16 INT; hh17 INT; hh18 INT; hh19 INT; hh20 INT;

  p_head    INT; -- ผู้ใหญ่บ้าน
  p_bed1    INT; -- ผู้ป่วยติดเตียง 1
  p_bed2    INT; -- ผู้ป่วยติดเตียง 2
  p_old1    INT; -- ผู้สูงอายุที่ต้องเยี่ยม
  p_kid1    INT; -- เด็กเล็ก 0-3 ปี

BEGIN

-- ── 0. ดึง Province / Amphur / Tambon ที่มีอยู่แล้ว ──────────
SELECT province_id INTO v_province_id FROM province WHERE name_th = 'เพชรบูรณ์' LIMIT 1;
SELECT amphur_id   INTO v_amphur_id   FROM amphur   WHERE name_th = 'ชนแดน'     AND province_id = v_province_id LIMIT 1;
SELECT tambon_id   INTO v_tambon_id   FROM tambon   WHERE name_th = 'ท่าข้าม'   AND amphur_id   = v_amphur_id   LIMIT 1;

RAISE NOTICE 'province=% amphur=% tambon=%', v_province_id, v_amphur_id, v_tambon_id;

-- ── 1. Village ──────────────────────────────────────────────
INSERT INTO village (tambon_id, village_name, moo)
VALUES (v_tambon_id, 'บ้านท่าข้าม', '1')
RETURNING village_id INTO v_village_id;

RAISE NOTICE 'village_id = %', v_village_id;

-- ── 2. Households (20 หลัง) ────────────────────────────────
-- พิกัดรอบพื้นที่ ต.ท่าข้าม อ.ชนแดน (ริมลำน้ำป่าสัก)
INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'1','1',15.9712,101.0265,'ดี','ระบบประปา',true,true,'บ้านผู้ใหญ่บ้าน') RETURNING household_id INTO hh1;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'2','1',15.9718,101.0270,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh2;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'3','1',15.9724,101.0275,'ปานกลาง','น้ำบาดาล',false,true,'') RETURNING household_id INTO hh3;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'4','1',15.9730,101.0280,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh4;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'5','1',15.9736,101.0285,'ทรุดโทรม','น้ำบาดาล',false,true,'ต้องซ่อมแซมหลังคา') RETURNING household_id INTO hh5;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'6','1',15.9742,101.0290,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh6;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'7','1',15.9748,101.0295,'ปานกลาง','ระบบประปา',true,true,'') RETURNING household_id INTO hh7;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'8','1',15.9754,101.0300,'ดี','ระบบประปา',false,true,'') RETURNING household_id INTO hh8;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'9','1',15.9760,101.0305,'ดี','น้ำบาดาล',true,true,'') RETURNING household_id INTO hh9;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'10','1',15.9708,101.0260,'ทรุดโทรม','น้ำฝน',false,true,'ผู้สูงอายุอยู่คนเดียว') RETURNING household_id INTO hh10;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'11','1',15.9705,101.0255,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh11;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'12','1',15.9700,101.0250,'ปานกลาง','ระบบประปา',true,true,'') RETURNING household_id INTO hh12;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'13','1',15.9695,101.0245,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh13;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'14','1',15.9690,101.0240,'ดี','ระบบประปา',false,true,'') RETURNING household_id INTO hh14;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'15','1',15.9685,101.0235,'ปานกลาง','น้ำบาดาล',true,true,'') RETURNING household_id INTO hh15;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'16','1',15.9680,101.0230,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh16;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'17','1',15.9675,101.0225,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh17;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'18','1',15.9670,101.0220,'ทรุดโทรม','น้ำบาดาล',false,true,'ผู้ป่วยติดเตียงอาศัยอยู่') RETURNING household_id INTO hh18;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'19','1',15.9665,101.0215,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh19;

INSERT INTO household (village_id,house_no,moo,gps_lat,gps_lng,house_condition,water_system,internet_access,electricity_access,remark)
VALUES (v_village_id,'20','1',15.9660,101.0210,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh20;

-- ── 3. Persons (~56 คน) ────────────────────────────────────

-- ครัวเรือน 1 — ผู้ใหญ่บ้าน
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh1,'สมศักดิ์','วงษ์คำ','ชาย',52,'1973-04-12',false,false,false,false,false,18000,'ผู้ใหญ่บ้าน/เกษตรกร',true,true,'2020-01-05')
RETURNING person_id INTO p_head;

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh1,'ลัดดา','วงษ์คำ','หญิง',49,'1976-09-08',false,false,false,false,false,8000,'แม่บ้าน/ค้าขาย',true,true,'2020-01-05');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh1,'อนุสรณ์','วงษ์คำ','ชาย',22,'2003-06-15',false,false,false,false,false,9000,'รับจ้าง',true,true,'2020-01-05');

-- ครัวเรือน 2
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh2,'ธีระ','สุดใจ','ชาย',45,'1980-11-03',false,false,false,false,false,14000,'รับเหมาก่อสร้าง',true,true,'2021-03-10');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh2,'ธิดา','สุดใจ','หญิง',42,'1983-07-17',false,false,false,false,false,9000,'ครู',true,true,'2021-03-10');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh2,'เด็กหญิงมินท์','สุดใจ','หญิง',2,'2023-08-20',false,false,false,false,false,NULL,'—',true,true,'2023-09-01')
RETURNING person_id INTO p_kid1;

-- ครัวเรือน 3
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh3,'วิเชียร','แสงอรุณ','ชาย',38,'1987-02-22',false,false,false,false,false,10000,'เกษตรกร',true,true,'2021-07-11');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh3,'วาสนา','แสงอรุณ','หญิง',35,'1990-05-05',false,false,false,false,false,7000,'ค้าขาย',true,true,'2021-07-11');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh3,'เด็กชายปุ้ม','แสงอรุณ','ชาย',3,'2022-10-10',false,false,false,false,false,NULL,'—',true,true,'2022-11-01');

-- ครัวเรือน 4 — ผู้สูงอายุ+ป่วย
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh4,'บุญส่ง','ป้องภัย','ชาย',71,'1954-01-30',true,false,false,true,true,3000,'เกษตรกร',true,true,'2019-08-15')
RETURNING person_id INTO p_old1;

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh4,'บุญมา','ป้องภัย','หญิง',68,'1957-06-14',true,false,false,true,true,0,'—',true,true,'2019-08-15');

-- ครัวเรือน 5 — บ้านทรุดโทรม
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh5,'สุพจน์','นาคสุวรรณ','ชาย',29,'1996-03-08',false,false,false,false,true,7500,'รับจ้าง',true,true,'2022-05-20');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh5,'สุภาพร','นาคสุวรรณ','หญิง',27,'1998-12-01',false,false,false,false,true,6000,'รับจ้าง',true,true,'2022-05-20');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh5,'เด็กหญิงฟ้า','นาคสุวรรณ','หญิง',1,'2024-04-05',false,false,false,false,false,NULL,'—',true,true,'2024-04-20');

-- ครัวเรือน 6
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh6,'ชาตรี','รักษาศิล','ชาย',55,'1970-07-07',false,false,false,false,false,20000,'ธุรกิจค้าข้าว',true,true,'2020-09-09');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh6,'ชวลิต','รักษาศิล','ชาย',25,'2000-02-14',false,false,false,false,false,11000,'พนักงานบริษัท',true,true,'2020-09-09');

-- ครัวเรือน 7 — ผู้พิการ
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh7,'ประเสริฐ','ทองหล่อ','ชาย',58,'1967-11-25',false,true,false,true,true,4000,'เกษตรกร',true,true,'2019-04-01');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh7,'ประไพ','ทองหล่อ','หญิง',55,'1970-03-18',false,false,false,false,true,5000,'แม่บ้าน',true,true,'2019-04-01');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh7,'สิทธิ์','ทองหล่อ','ชาย',18,'2007-09-09',false,false,false,false,false,NULL,'นักเรียน',true,true,'2019-04-01');

-- ครัวเรือน 8
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh8,'นิรันดร์','คงเจริญ','ชาย',40,'1985-08-30',false,false,false,false,false,12000,'รับเหมาก่อสร้าง',true,true,'2021-06-15');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh8,'นิตยา','คงเจริญ','หญิง',37,'1988-04-11',false,false,false,false,false,8000,'ค้าขาย',true,true,'2021-06-15');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh8,'เด็กชายปอนด์','คงเจริญ','ชาย',9,'2016-12-25',false,false,false,false,false,NULL,'นักเรียน',true,true,'2021-06-15');

-- ครัวเรือน 9
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh9,'พิทักษ์','ศรีบุญมา','ชาย',33,'1992-05-20',false,false,false,false,false,13000,'วิศวกร',true,true,'2023-02-01');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh9,'พิไลวรรณ','ศรีบุญมา','หญิง',31,'1994-10-10',false,false,false,false,false,11000,'นักบัญชี',true,true,'2023-02-01');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh9,'เด็กชายอาร์ม','ศรีบุญมา','ชาย',2,'2023-12-05',false,false,false,false,false,NULL,'—',true,true,'2024-01-10');

-- ครัวเรือน 10 — ผู้สูงอายุอยู่คนเดียว
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh10,'แสวง','โพธิ์ศรี','ชาย',74,'1951-03-03',true,false,false,true,true,0,'—',true,true,'2018-11-01');

-- ครัวเรือน 11
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh11,'กำพล','เพ็ชรงาม','ชาย',48,'1977-07-07',false,false,false,false,false,9000,'เกษตรกร',true,true,'2020-04-04');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh11,'กาญจนา','เพ็ชรงาม','หญิง',45,'1980-01-15',false,false,false,false,false,6000,'แม่บ้าน',true,true,'2020-04-04');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh11,'เด็กหญิงเบลล์','เพ็ชรงาม','หญิง',14,'2011-06-01',false,false,false,false,false,NULL,'นักเรียน',true,true,'2020-04-04');

-- ครัวเรือน 12
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh12,'อมรเทพ','สมใจ','ชาย',50,'1975-09-22',false,false,false,false,false,16000,'ผู้รับเหมา',true,true,'2020-12-12');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh12,'อมรา','สมใจ','หญิง',47,'1978-02-28',false,false,false,false,false,10000,'ครู',true,true,'2020-12-12');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh12,'เด็กชายพีช','สมใจ','ชาย',16,'2009-03-14',false,false,false,false,false,NULL,'นักเรียน',true,true,'2020-12-12');

-- ครัวเรือน 13 — ผู้สูงอายุคู่
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh13,'ชาญ','อินทราช','ชาย',65,'1960-08-18',true,false,false,false,true,3500,'เกษตรกร',true,true,'2019-05-05');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh13,'ชิต','อินทราช','หญิง',62,'1963-12-30',true,false,false,true,true,2000,'แม่บ้าน',true,true,'2019-05-05');

-- ครัวเรือน 14
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh14,'ทรงพล','ดวงดี','ชาย',36,'1989-04-04',false,false,false,false,false,11000,'พนักงาน',true,true,'2022-07-07');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh14,'ทิพย์วรรณ','ดวงดี','หญิง',34,'1991-10-10',false,false,false,false,false,9000,'พนักงาน',true,true,'2022-07-07');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh14,'เด็กชายต้นข้าว','ดวงดี','ชาย',6,'2019-11-11',false,false,false,false,false,NULL,'นักเรียน',true,true,'2022-07-07');

-- ครัวเรือน 15
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh15,'สุเทพ','แก้วกาหลง','ชาย',60,'1965-06-06',true,false,false,true,true,4000,'เกษตรกร',true,true,'2019-09-09');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh15,'สุนทรี','แก้วกาหลง','หญิง',57,'1968-01-01',false,false,false,false,true,3500,'แม่บ้าน',true,true,'2019-09-09');

-- ครัวเรือน 16
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh16,'ศักดิ์ดา','หมื่นพล','ชาย',43,'1982-05-15',false,false,false,false,false,11500,'เกษตรกร',true,true,'2021-10-10');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh16,'ศิริลักษณ์','หมื่นพล','หญิง',40,'1985-08-08',false,false,false,false,false,7500,'ค้าขาย',true,true,'2021-10-10');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh16,'เด็กหญิงน้ำฝน','หมื่นพล','หญิง',12,'2013-07-20',false,false,false,false,false,NULL,'นักเรียน',true,true,'2021-10-10');

-- ครัวเรือน 17
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh17,'รุ่งโรจน์','พรหมบุตร','ชาย',28,'1997-02-02',false,false,false,false,false,8500,'รับจ้าง',true,true,'2023-04-15');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh17,'รุ่งนภา','พรหมบุตร','หญิง',26,'1999-09-09',false,false,false,false,false,7000,'รับจ้าง',true,true,'2023-04-15');

-- ครัวเรือน 18 — ผู้ป่วยติดเตียง
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh18,'นงลักษณ์','สีเสน','หญิง',77,'1948-10-01',true,true,true,true,true,0,'—',true,true,'2017-06-01')
RETURNING person_id INTO p_bed1;

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh18,'สมาน','สีเสน','ชาย',50,'1975-04-04',false,false,false,false,false,8000,'รับจ้าง',true,true,'2017-06-01');

-- ครัวเรือน 19
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh19,'จักรกฤษณ์','ไชยขันธ์','ชาย',46,'1979-12-12',false,false,false,false,false,15000,'ธุรกิจส่วนตัว',true,true,'2020-06-06');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh19,'จันทิมา','ไชยขันธ์','หญิง',43,'1982-03-25',false,false,false,false,false,9000,'ค้าขาย',true,true,'2020-06-06');

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh19,'เด็กชายเอ็ม','ไชยขันธ์','ชาย',7,'2018-05-05',false,false,false,false,false,NULL,'นักเรียน',true,true,'2020-06-06');

-- ครัวเรือน 20 — ผู้ป่วยติดเตียง
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh20,'เพิ่ม','ขันธะรักษ์','ชาย',69,'1956-08-08',true,false,true,true,true,0,'—',true,true,'2018-03-03')
RETURNING person_id INTO p_bed2;

INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh20,'เพ็ญ','ขันธะรักษ์','หญิง',66,'1959-11-11',true,false,false,true,true,3000,'แม่บ้าน',true,true,'2018-03-03');

-- ── 4. Community Issues (10 รายการ) ────────────────────────
INSERT INTO community_issue (village_id,area,issue_type,severity,status,owner,impact_people,remark,created_at)
VALUES
  (v_village_id,'ถนนสายท่าข้าม-ชนแดน','ถนนชำรุด/หลุมบ่อ',4,'เปิด','อบต.ท่าข้าม',180,'หลุมบ่อขนาดใหญ่ช่วงฤดูฝน อันตรายต่อจักรยานยนต์','2025-09-15 08:00:00'),
  (v_village_id,'คลองส่งน้ำหมู่บ้าน','ระบบชลประทานชำรุด',3,'กำลังดำเนินการ','ชลประทาน',120,'ประตูน้ำชำรุด ไม่สามารถกักเก็บน้ำได้','2025-10-01 09:00:00'),
  (v_village_id,'ศาลาประชาคม','ไฟฟ้าส่องสว่างไม่พอ',2,'แก้ไขแล้ว','การไฟฟ้า',80,'ติดตั้งหลอดไฟ LED เพิ่มแล้ว','2025-07-20 10:00:00'),
  (v_village_id,'หมู่บ้าน','ขยะมูลฝอยล้น',3,'เปิด','อบต.ท่าข้าม',320,'ไม่มีรถเก็บขยะสม่ำเสมอ','2026-01-10 11:00:00'),
  (v_village_id,'ริมลำน้ำป่าสัก','ตลิ่งพังทลาย',5,'เปิด','กรมชลประทาน',200,'ตลิ่งพังต่อเนื่อง คุกคามบ้านริมน้ำ 5 หลัง','2026-02-05 08:00:00'),
  (v_village_id,'โรงเรียนบ้านท่าข้าม','ห้องน้ำนักเรียนชำรุด',3,'กำลังดำเนินการ','เขตการศึกษา',110,'ห้องน้ำฝั่งหญิง 3 ห้อง ใช้การไม่ได้','2026-03-10 09:00:00'),
  (v_village_id,'ถนนในหมู่บ้าน','ไฟกิ่งดับ',2,'กำลังดำเนินการ','การไฟฟ้า',150,'ไฟกิ่ง 4 ต้น ดับตั้งแต่เดือน ก.พ.','2026-04-01 07:00:00'),
  (v_village_id,'บ้านผู้สูงอายุ','ผู้สูงอายุขาดผู้ดูแล',4,'เปิด','อสม.',25,'มีผู้สูงอายุ 3 รายอยู่คนเดียว ต้องการความช่วยเหลือ','2026-04-15 08:30:00'),
  (v_village_id,'สะพานท้ายหมู่บ้าน','สะพานผุพัง',4,'เปิด','แขวงทางหลวงชนบท',260,'สะพานคอนกรีตร้าว ห้ามรถหนักเกิน 5 ตัน','2026-05-01 10:00:00'),
  (v_village_id,'พื้นที่เกษตรกรรม','ราคาผลผลิตตกต่ำ',2,'เปิด','เกษตรอำเภอ',280,'ข้าวโพดราคาลด ชาวบ้านขาดทุน','2026-05-10 14:00:00');

-- ── 5. Visit Logs (15 ครั้ง) ───────────────────────────────
INSERT INTO visit_log (household_id,person_id,visit_date,visitor,visit_reason,summary,created_at) VALUES
  (hh18, p_bed1, '2026-06-10','นางสาวจิราภรณ์ อสม.','เยี่ยมผู้ป่วยติดเตียง','อาการทรงตัว กลืนอาหารลำบาก ประสาน รพ.สต. จัดอาหารเหลว','2026-06-10 09:00:00'),
  (hh18, p_bed1, '2026-05-15','นางสาวจิราภรณ์ อสม.','ติดตามอาการ','แผลกดทับดีขึ้น พลิกตัวทุก 2 ชั่วโมงแล้ว','2026-05-15 10:00:00'),
  (hh20, p_bed2, '2026-06-05','นายสุเมธ เจ้าหน้าที่','เยี่ยมผู้ป่วยติดเตียง','ประเมินสุขภาพ ส่งต่อพยาบาลชุมชน','2026-06-05 09:30:00'),
  (hh20, p_bed2, '2026-04-20','นางสาวจิราภรณ์ อสม.','ติดตามการรับยา','รับยาต่อเนื่อง ครอบครัวดูแลใกล้ชิด','2026-04-20 11:00:00'),
  (hh4,  p_old1, '2026-05-25','นายสุเมธ เจ้าหน้าที่','เยี่ยมผู้สูงอายุป่วย','วัดความดัน 140/90 แนะนำลดเค็ม รับยาต่อเนื่อง','2026-05-25 10:30:00'),
  (hh10, NULL,   '2026-06-01','นางสาวจิราภรณ์ อสม.','เยี่ยมผู้สูงอายุอยู่คนเดียว','สุขภาพพอใช้ได้ ขาดแคลนอาหาร ประสานสวัสดิการ','2026-06-01 08:30:00'),
  (hh13, NULL,   '2026-05-18','นายสุเมธ เจ้าหน้าที่','เยี่ยมผู้สูงอายุ','ทั้งคู่สุขภาพดีพอสมควร ออกกำลังกายสม่ำเสมอ','2026-05-18 09:00:00'),
  (hh5,  NULL,   '2026-05-10','นางสาวจิราภรณ์ อสม.','ติดตามแม่และเด็กแรกเกิด','ทารกพัฒนาการปกติ น้ำหนัก 4.2 กก. วัคซีนครบ','2026-05-10 11:00:00'),
  (hh2,  p_kid1, '2026-04-28','นางสาวจิราภรณ์ อสม.','ติดตามเด็กเล็ก','น้ำหนักดี พัฒนาการตามวัย','2026-04-28 10:00:00'),
  (hh7,  NULL,   '2026-04-10','นายสุเมธ เจ้าหน้าที่','เยี่ยมผู้พิการ','จัดหาอุปกรณ์เสริมการเดิน ส่งต่อกองทุนผู้พิการ','2026-04-10 13:00:00'),
  (hh15, NULL,   '2026-03-25','นายสุเมธ เจ้าหน้าที่','เยี่ยมผู้ป่วยความดัน','วัดความดัน 150/95 ปรับยา','2026-03-25 10:00:00'),
  (hh1,  NULL,   '2026-03-15','นายสุเมธ เจ้าหน้าที่','ประชุมผู้ใหญ่บ้าน','สรุปปัญหาชุมชน วางแผนแก้ไขถนนและตลิ่ง','2026-03-15 14:00:00'),
  (hh3,  NULL,   '2026-02-20','นางสาวจิราภรณ์ อสม.','คัดกรองสุขภาพ','ตรวจเบาหวาน-ความดัน ปกติทุกราย','2026-02-20 09:00:00'),
  (hh11, NULL,   '2026-02-10','นางสาวจิราภรณ์ อสม.','เยี่ยมครัวเรือนทั่วไป','ติดตามสุขอนามัย แนะนำออกกำลังกาย','2026-02-10 10:30:00'),
  (hh6,  NULL,   '2026-01-20','นายสุเมธ เจ้าหน้าที่','คัดกรองมะเร็ง','ผู้สูงอายุชาย 4 ราย ตรวจมะเร็งลำไส้ ปกติ','2026-01-20 09:00:00');

-- ── 6. Training Events (4 รายการ) ──────────────────────────
INSERT INTO training_event (village_id,training_name,training_type,organizer,start_date,end_date,location,description,created_at)
VALUES
  (v_village_id,'การปลูกข้าวโพดหวานอินทรีย์','เกษตรกรรม','เกษตรอำเภอชนแดน','2026-07-20','2026-07-21','ศาลาประชาคมหมู่ 1','เทคนิคลดต้นทุน เพิ่มราคา ตลาดออนไลน์','2026-06-01 09:00:00'),
  (v_village_id,'การดูแลผู้ป่วยติดเตียงที่บ้าน','สาธารณสุข','สาธารณสุขอำเภอชนแดน','2026-08-10','2026-08-10','รพ.สต.ท่าข้าม','การพลิกตัว ป้องกันแผลกดทับ อาหารผู้ป่วย สำหรับ อสม. และครอบครัว','2026-06-15 10:00:00'),
  (v_village_id,'การท่องเที่ยวเชิงเกษตร','ท่องเที่ยว/เศรษฐกิจ','ททท. ภาคเหนือตอนล่าง','2026-09-05','2026-09-06','หมู่บ้านท่าข้าม','พัฒนาหมู่บ้านเป็นแหล่งท่องเที่ยว ตลาดชุมชน','2026-07-01 09:00:00'),
  (v_village_id,'การจัดการขยะชุมชน','สิ่งแวดล้อม','อบต.ท่าข้าม','2025-11-20','2025-11-20','ศาลาประชาคมหมู่ 1','คัดแยกขยะ แปรรูปขยะอินทรีย์ สร้างรายได้จากขยะ','2025-10-15 09:00:00');

-- ── 7. Household Economic (รายได้ปี 2021–2025) ─────────────
INSERT INTO household_economic (household_id,income_total_per_month,debt_total,debt_type,poor_flag,record_date,created_at)
VALUES
  -- 2021
  (hh1,  18000,  80000,'กู้ยืมธนาคาร',false,'2021-12-31','2021-12-31 10:00:00'),
  (hh5,  13500,  25000,'กู้ยืมธนาคาร',true, '2021-12-31','2021-12-31 10:00:00'),
  (hh7,   9000,  40000,'หนี้นอกระบบ', true, '2021-12-31','2021-12-31 10:00:00'),
  (hh11,  9000,  20000,'กู้ยืมธนาคาร',false,'2021-12-31','2021-12-31 10:00:00'),
  (hh16, 11500,  30000,'กู้ยืมธนาคาร',false,'2021-12-31','2021-12-31 10:00:00'),
  -- 2022
  (hh1,  20000,  70000,'กู้ยืมธนาคาร',false,'2022-12-31','2022-12-31 10:00:00'),
  (hh5,  14000,  20000,'กู้ยืมธนาคาร',false,'2022-12-31','2022-12-31 10:00:00'),
  (hh6,  31000,      0,NULL,           false,'2022-12-31','2022-12-31 10:00:00'),
  (hh9,  24000, 120000,'กู้ยืมธนาคาร',false,'2022-12-31','2022-12-31 10:00:00'),
  (hh12, 26000,  50000,'กู้ยืมธนาคาร',false,'2022-12-31','2022-12-31 10:00:00'),
  -- 2023
  (hh1,  22000,  60000,'กู้ยืมธนาคาร',false,'2023-12-31','2023-12-31 10:00:00'),
  (hh6,  33000,      0,NULL,           false,'2023-12-31','2023-12-31 10:00:00'),
  (hh9,  26000, 100000,'กู้ยืมธนาคาร',false,'2023-12-31','2023-12-31 10:00:00'),
  (hh12, 28000,  40000,'กู้ยืมธนาคาร',false,'2023-12-31','2023-12-31 10:00:00'),
  (hh19, 24000,  30000,'กู้ยืมธนาคาร',false,'2023-12-31','2023-12-31 10:00:00'),
  -- 2024
  (hh1,  25000,  50000,'กู้ยืมธนาคาร',false,'2024-12-31','2024-12-31 10:00:00'),
  (hh6,  35000,      0,NULL,           false,'2024-12-31','2024-12-31 10:00:00'),
  (hh9,  28000,  80000,'กู้ยืมธนาคาร',false,'2024-12-31','2024-12-31 10:00:00'),
  (hh12, 30000,  25000,'กู้ยืมธนาคาร',false,'2024-12-31','2024-12-31 10:00:00'),
  (hh19, 27000,  15000,'กู้ยืมธนาคาร',false,'2024-12-31','2024-12-31 10:00:00'),
  -- 2025
  (hh1,  27000,  40000,'กู้ยืมธนาคาร',false,'2025-12-31','2025-12-31 10:00:00'),
  (hh6,  38000,      0,NULL,           false,'2025-12-31','2025-12-31 10:00:00'),
  (hh9,  30000,  60000,'กู้ยืมธนาคาร',false,'2025-12-31','2025-12-31 10:00:00'),
  (hh12, 32000,  10000,'กู้ยืมธนาคาร',false,'2025-12-31','2025-12-31 10:00:00'),
  (hh19, 29000,      0,NULL,           false,'2025-12-31','2025-12-31 10:00:00');

-- ── 8. App Users ────────────────��───────────────────────────
-- role_level: ADMIN | PROVINCE | AMPHUR | TAMBON | VILLAGE
-- scope_id  : id ของ entity ในระดับนั้น (village_id สำหรับ VILLAGE ฯลฯ)
--
-- รหัสผ่าน (BCrypt):
--   admin        → admin1234
--   phetchabun   → province1234  (ใช้ hash เดียวกับ admin เพื่อความสะดวก demo)
--   chandane     → amphur1234
--   takharm_abt  → tambon1234
--   village_m1   → village1234

INSERT INTO app_user
  (username, password_hash, full_name, role_level, scope_id, province_id, amphur_id, tambon_id, is_active, created_at)
VALUES
  -- ADMIN — เข้าได้ทุกหมู่บ้านทุกจังหวัด
  ('admin',
   '$2b$12$g.ydScir90LjMtDkN6j4F.h7Rn1X8bpaUqJThqkxV4LiCaec9C9j2',
   'ผู้ดูแลระบบ', 'ADMIN', NULL, NULL, NULL, NULL, true, NOW()),

  -- PROVINCE — จ.เพชรบูรณ์
  ('phetchabun',
   '$2b$12$g.ydScir90LjMtDkN6j4F.h7Rn1X8bpaUqJThqkxV4LiCaec9C9j2',
   'พัฒนาชุมชนจังหวัดเพชรบูรณ์', 'PROVINCE', v_province_id, v_province_id, NULL, NULL, true, NOW()),

  -- AMPHUR — อ.ชนแดน
  ('chandane',
   '$2b$12$iuO1A5qXSIp7jlfncNlqxuufGdz51wpLwKQCEvyfHbjzZwE80FxtO',
   'พัฒนาชุมชนอำเภอชนแดน', 'AMPHUR', v_amphur_id, v_province_id, v_amphur_id, NULL, true, NOW()),

  -- TAMBON — อบต.ท่าข้าม
  ('takharm_abt',
   '$2b$12$A0Wfq8WYyzOguJVVPNIN7O8oJ2hybXakyeiGWVKk1AfvWW3gJ6lZe',
   'อบต.ท่าข้าม', 'TAMBON', v_tambon_id, v_province_id, v_amphur_id, v_tambon_id, true, NOW()),

  -- VILLAGE — ผู้ใหญ่บ้าน ม.1
  ('village_m1',
   '$2b$12$la.vTDNnugZeshdZVwWCCO2AlZJijDzLntm9k7FMRYFV.he5ivw4K',
   'นายสมศักดิ์ วงษ์คำ (ผู้ใหญ่บ้าน ม.1)', 'VILLAGE', v_village_id, v_province_id, v_amphur_id, v_tambon_id, true, NOW())

ON CONFLICT (username) DO NOTHING;

RAISE NOTICE 'app_user inserted (village_id=%)', v_village_id;

END $$;

-- ============================================================
--  สรุปข้อมูล Dashboard:
--  หมู่บ้าน: ม.1 บ้านท่าข้าม ต.ท่าข้าม อ.ชนแดน จ.เพชรบูรณ์ 67150
--  ครัวเรือน: 20 หลัง
--  ประชากร: ~56 คน (ชาย 27 / หญิง 29)
--  เด็ก 0-3 ปี: 4 คน | ผู้สูงอายุ: 10 คน | ผู้พิการ: 2 คน
--  ผู้ป่วยติดเตียง: 2 คน | ผู้ป่วยเรื้อรัง: 6 คน
--  ถือบัตรสวัสดิการ: 9 คน | อินเทอร์เน็ต: 14/20 = 70%
--  ปัญหาชุมชน: 10 (เปิด 6 / ดำเนินการ 3 / แก้แล้ว 1)
--  เยี่ยมบ้าน: 15 ครั้ง (ล่าสุด มิ.ย. 2026)
--  การอบรม: 4 รายการ (ที่กำลังจะมา 3 / ผ่านแล้ว 1)
--  รายได้ชุมชน: trend ขึ้นปี 2021-2025
-- ============================================================
