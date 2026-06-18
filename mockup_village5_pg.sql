-- ============================================================
--  MOCKUP DATA — village_id = 5  (PostgreSQL / pgAdmin)
--  ทดสอบ Dashboard ทุก section
-- ============================================================

DO $$
DECLARE
  hh1  INT; hh2  INT; hh3  INT; hh4  INT; hh5  INT;
  hh6  INT; hh7  INT; hh8  INT; hh9  INT; hh10 INT;
  hh11 INT; hh12 INT; hh13 INT; hh14 INT; hh15 INT;
  hh16 INT; hh17 INT; hh18 INT; hh19 INT; hh20 INT;
  p_bed1 INT; p_bed2 INT; p_old1 INT;
BEGIN

-- ── 1. Village ──────────────────────────────────────────────
INSERT INTO village (village_id, village_name, moo, tambon_id)
VALUES (5, 'บ้านสามัคคี', '7', NULL)
ON CONFLICT (village_id) DO NOTHING;

-- ── 2. Households (20 หลัง) ────────────────────────────────
INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'1/1','7',18.7883,98.9853,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh1;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'1/2','7',18.7885,98.9856,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh2;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'2/1','7',18.7890,98.9860,'ปานกลาง','น้ำบาดาล',false,true,'') RETURNING household_id INTO hh3;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'2/2','7',18.7892,98.9862,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh4;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'3/1','7',18.7879,98.9848,'ทรุดโทรม','น้ำบาดาล',false,true,'ต้องซ่อมแซม') RETURNING household_id INTO hh5;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'3/2','7',18.7881,98.9845,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh6;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'4/1','7',18.7875,98.9840,'ปานกลาง','ระบบประปา',true,true,'') RETURNING household_id INTO hh7;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'4/2','7',18.7870,98.9838,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh8;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'5/1','7',18.7865,98.9835,'ดี','ระบบประปา',false,true,'') RETURNING household_id INTO hh9;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'5/2','7',18.7860,98.9830,'ทรุดโทรม','น้ำฝน',false,true,'') RETURNING household_id INTO hh10;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'6/1','7',18.7895,98.9870,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh11;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'6/2','7',18.7898,98.9873,'ปานกลาง','ระบบประปา',true,true,'') RETURNING household_id INTO hh12;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'7/1','7',18.7900,98.9875,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh13;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'7/2','7',18.7902,98.9878,'ดี','ระบบประปา',false,true,'') RETURNING household_id INTO hh14;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'8/1','7',18.7905,98.9880,'ดี','น้ำบาดาล',true,true,'') RETURNING household_id INTO hh15;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'8/2','7',18.7907,98.9882,'ปานกลาง','ระบบประปา',true,true,'') RETURNING household_id INTO hh16;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'9/1','7',18.7910,98.9885,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh17;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'9/2','7',18.7912,98.9887,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh18;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'10/1','7',18.7915,98.9890,'ทรุดโทรม','น้ำบาดาล',false,true,'') RETURNING household_id INTO hh19;

INSERT INTO household (village_id, house_no, moo, gps_lat, gps_lng, house_condition, water_system, internet_access, electricity_access, remark)
VALUES (5,'10/2','7',18.7917,98.9893,'ดี','ระบบประปา',true,true,'') RETURNING household_id INTO hh20;

-- ── 3. Persons (~58 คน) ────────────────────────────────────
-- ครัวเรือน 1
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh1,'สมชาย','ใจดี','ชาย',45,'1980-03-15',false,false,false,false,false,12000,'เกษตรกร',true,true,'2021-01-10');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh1,'สมหญิง','ใจดี','หญิง',42,'1983-06-20',false,false,false,false,false,8000,'แม่บ้าน',true,true,'2021-01-10');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh1,'เด็กชายก้อง','ใจดี','ชาย',2,'2023-04-01',false,false,false,false,false,NULL,'—',true,true,'2023-04-15');

-- ครัวเรือน 2
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh2,'วิชัย','สุขใจ','ชาย',68,'1957-08-12',true,false,false,false,true,5000,'เกษตรกร',true,true,'2020-05-20') RETURNING person_id INTO p_old1;
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh2,'มาลี','สุขใจ','หญิง',65,'1960-11-30',true,false,false,true,true,3000,'แม่บ้าน',true,true,'2020-05-20');

-- ครัวเรือน 3
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh3,'อนุชา','ทองดี','ชาย',35,'1990-02-14',false,false,false,false,false,9000,'รับจ้าง',true,true,'2021-08-05');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh3,'รัตนา','ทองดี','หญิง',32,'1993-07-22',false,false,false,false,false,7500,'ค้าขาย',true,true,'2021-08-05');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh3,'เด็กหญิงนิดา','ทองดี','หญิง',1,'2024-01-10',false,false,false,false,false,NULL,'—',true,true,'2024-01-20');

-- ครัวเรือน 4 (ผู้พิการ + ผู้ป่วยติดเตียง)
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh4,'ประสงค์','มั่นคง','ชาย',72,'1953-05-03',true,true,false,true,true,4000,'เกษตรกร',true,true,'2019-12-01');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh4,'จันทร์','มั่นคง','หญิง',70,'1955-09-18',true,false,true,true,true,0,'—',true,true,'2019-12-01') RETURNING person_id INTO p_bed1;

-- ครัวเรือน 5
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh5,'สุรชัย','แสงทอง','ชาย',28,'1997-03-25',false,false,false,false,false,11000,'พนักงาน',true,true,'2022-03-10');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh5,'สุนิสา','แสงทอง','หญิง',26,'1999-11-08',false,false,false,false,false,9500,'พนักงาน',true,true,'2022-03-10');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh5,'เด็กชายเจมส์','แสงทอง','ชาย',3,'2022-09-01',false,false,false,false,false,NULL,'—',true,true,'2022-09-15');

-- ครัวเรือน 6
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh6,'ทวีศักดิ์','ดีมาก','ชาย',55,'1970-01-01',false,false,false,false,false,15000,'ข้าราชการ',true,true,'2020-11-11');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh6,'วารี','ดีมาก','หญิง',52,'1973-07-07',false,false,false,false,false,12000,'ครู',true,true,'2020-11-11');

-- ครัวเรือน 7
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh7,'บุญมี','ศรีทอง','ชาย',62,'1963-04-04',true,false,false,true,true,2500,'เกษตรกร',true,true,'2019-06-15');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh7,'บุญเรือน','ศรีทอง','หญิง',60,'1965-10-10',true,false,false,false,true,2000,'แม่บ้าน',true,true,'2019-06-15');

-- ครัวเรือน 8
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh8,'ปิยะ','รุ่งเรือง','ชาย',40,'1985-12-25',false,false,false,false,false,13000,'ธุรกิจส่วนตัว',true,true,'2021-04-22');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh8,'ปิยะนุช','รุ่งเรือง','หญิง',37,'1988-08-15',false,false,false,false,false,10000,'ค้าขาย',true,true,'2021-04-22');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh8,'เด็กชายเบส','รุ่งเรือง','ชาย',10,'2015-02-20',false,false,false,false,false,NULL,'นักเรียน',true,true,'2021-04-22');

-- ครัวเรือน 9 (ผู้ป่วยติดเตียง อยู่คนเดียว)
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh9,'ลักษมี','วงศ์ไทย','หญิง',75,'1950-07-07',true,true,true,true,true,0,'—',true,true,'2018-09-09') RETURNING person_id INTO p_bed2;

-- ครัวเรือน 10
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh10,'นิรันดร์','ชูเกียรติ','ชาย',48,'1977-06-30',false,false,false,false,false,8500,'รับจ้าง',true,true,'2020-07-07');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh10,'นิรมล','ชูเกียรติ','หญิง',45,'1980-11-15',false,false,false,false,false,6000,'แม่บ้าน',true,true,'2020-07-07');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh10,'เด็กหญิงแนน','ชูเกียรติ','หญิง',15,'2010-04-01',false,false,false,false,false,NULL,'นักเรียน',true,true,'2020-07-07');

-- ครัวเรือน 11
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh11,'จิรายุ','ป้องกัน','ชาย',22,'2003-08-08',false,false,false,false,false,7000,'รับจ้าง',true,true,'2022-12-01');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh11,'จิราวรรณ','ป้องกัน','หญิง',20,'2005-03-03',false,false,false,false,false,6500,'รับจ้าง',true,true,'2022-12-01');

-- ครัวเรือน 12
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh12,'ศิริพงษ์','สงบเย็น','ชาย',58,'1967-09-09',false,true,false,true,true,3500,'เกษตรกร',true,true,'2019-05-05');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh12,'ศิริพร','สงบเย็น','หญิง',55,'1970-12-12',false,false,false,false,false,5000,'แม่บ้าน',true,true,'2019-05-05');

-- ครัวเรือน 13
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh13,'ธนาพล','เมืองทอง','ชาย',33,'1992-01-15',false,false,false,false,false,16000,'วิศวกร',true,true,'2023-01-20');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh13,'ธนาวดี','เมืองทอง','หญิง',31,'1994-06-25',false,false,false,false,false,14000,'นักบัญชี',true,true,'2023-01-20');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh13,'เด็กชายไทม์','เมืองทอง','ชาย',2,'2023-11-11',false,false,false,false,false,NULL,'—',true,true,'2023-11-20');

-- ครัวเรือน 14
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh14,'อภิชาติ','สว่างใจ','ชาย',50,'1975-03-18',false,false,false,false,false,18000,'ผู้รับเหมา',true,true,'2020-02-02');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh14,'อภิญญา','สว่างใจ','หญิง',47,'1978-10-10',false,false,false,false,false,12000,'ครู',true,true,'2020-02-02');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh14,'เด็กหญิงฝน','สว่างใจ','หญิง',16,'2009-07-07',false,false,false,false,false,NULL,'นักเรียน',true,true,'2020-02-02');

-- ครัวเรือน 15
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh15,'วิโรจน์','แจ่มใส','ชาย',66,'1959-02-02',true,false,false,true,true,2800,'เกษตรกร',true,true,'2019-01-01');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh15,'วิลาวรรณ','แจ่มใส','หญิง',63,'1962-05-15',true,false,false,false,true,2000,'แม่บ้าน',true,true,'2019-01-01');

-- ครัวเรือน 16
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh16,'พรชัย','มีสุข','ชาย',38,'1987-04-12',false,false,false,false,false,9500,'พนักงาน',true,true,'2022-06-15');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh16,'พรรณี','มีสุข','หญิง',36,'1989-08-28',false,false,false,false,false,8500,'พนักงาน',true,true,'2022-06-15');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh16,'เด็กชายเพชร','มีสุข','ชาย',8,'2017-02-14',false,false,false,false,false,NULL,'นักเรียน',true,true,'2022-06-15');

-- ครัวเรือน 17
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh17,'กิตติศักดิ์','สีดา','ชาย',44,'1981-11-22',false,false,false,false,false,11000,'เกษตรกร',true,true,'2021-09-09');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh17,'กิตติมา','สีดา','หญิง',41,'1984-04-04',false,false,false,false,false,7000,'ค้าขาย',true,true,'2021-09-09');

-- ครัวเรือน 18
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh18,'มนัส','หาญกล้า','ชาย',30,'1995-07-17',false,false,false,false,false,8000,'รับจ้าง',true,true,'2023-07-07');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh18,'มณีรัตน์','หาญกล้า','หญิง',28,'1997-01-01',false,false,false,false,false,7500,'ค้าขาย',true,true,'2023-07-07');

-- ครัวเรือน 19
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh19,'ชัยวัฒน์','สมบูรณ์','ชาย',71,'1954-06-06',true,true,false,true,true,0,'—',true,true,'2018-06-06');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh19,'ชัยสุดา','สมบูรณ์','หญิง',69,'1956-10-20',true,false,false,true,true,0,'—',true,true,'2018-06-06');

-- ครัวเรือน 20
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh20,'นพดล','พรหมดี','ชาย',52,'1973-08-30',false,false,false,false,false,14000,'ธุรกิจส่วนตัว',true,true,'2020-10-10');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh20,'นพมาศ','พรหมดี','หญิง',49,'1976-03-15',false,false,false,false,false,10000,'ค้าขาย',true,true,'2020-10-10');
INSERT INTO person (household_id,first_name,last_name,gender,age,birth_date,is_elderly,is_disabled,is_bedridden,is_sick,welfare_card,income_per_month,occupation,is_registered_in_village,is_living_in_village,created_at)
VALUES (hh20,'เด็กหญิงดาว','พรหมดี','หญิง',5,'2020-05-05',false,false,false,false,false,NULL,'—',true,true,'2020-10-10');

-- ── 4. Community Issues (10 รายการ) ────────────────────────
INSERT INTO community_issue (village_id,area,issue_type,severity,status,owner,impact_people,remark,created_at)
VALUES
  (5,'ถนนสายหลัก','ถนนชำรุด',4,'เปิด','อบต.',150,'หลุมบ่อขนาดใหญ่ อันตราย','2025-11-01 09:00:00'),
  (5,'บ่อน้ำชุมชน','แหล่งน้ำเสีย',3,'กำลังดำเนินการ','เทศบาล',200,'น้ำมีสี-กลิ่นผิดปกติ','2025-10-15 10:00:00'),
  (5,'ศาลากลางบ้าน','ไฟฟ้าส่องสว่างไม่เพียงพอ',2,'กำลังดำเนินการ','การไฟฟ้า',80,'หลอดไฟดับหลายดวง','2025-12-01 08:00:00'),
  (5,'หมู่บ้าน','ขยะมูลฝอย',3,'เปิด','อบต.',300,'ไม่มีที่ทิ้งขยะเพียงพอ','2026-01-05 11:00:00'),
  (5,'โรงเรียน','อาคารชำรุด',5,'เปิด','กรมส่งเสริม',120,'หลังคาโรงอาหารรั่ว','2026-02-10 13:00:00'),
  (5,'สะพานเชื่อม','สะพานชำรุด',4,'กำลังดำเนินการ','แขวงทางหลวง',250,'สะพานไม้ผุ ห้ามรถบรรทุก','2026-03-01 09:30:00'),
  (5,'คลองส่งน้ำ','ท่อน้ำประปาชำรุด',3,'เปิด','ประปา',180,'น้ำรั่วทุกคืน','2026-04-01 07:00:00'),
  (5,'วัดประจำหมู่บ้าน','เสาไฟฟ้าเอียง',2,'แก้ไขแล้ว','การไฟฟ้า',50,'ซ่อมแซมแล้วเมื่อ มี.ค. 2566','2025-08-01 10:00:00'),
  (5,'ที่ดินส่วนกลาง','พื้นที่สีเขียวลดลง',1,'แก้ไขแล้ว','อบต.',400,'ปลูกต้นไม้เพิ่มแล้ว','2025-07-15 14:00:00'),
  (5,'บ้านผู้สูงอายุ','ผู้สูงอายุขาดผู้ดูแล',4,'เปิด','อสม.',30,'2 ราย อยู่คนเดียว','2026-05-01 08:00:00');

-- ── 5. Visit Logs (15 ครั้ง) ───────────────────────────────
INSERT INTO visit_log (household_id,person_id,visit_date,visitor,visit_reason,summary,created_at) VALUES
  (hh9, p_bed2,'2026-05-02','นางสาวอรุณ อสม.','เยี่ยมผู้ป่วยติดเตียง','ผู้ป่วยอาการทรงตัว ต้องการยาต่อเนื่อง','2026-05-02 10:00:00'),
  (hh9, p_bed2,'2026-04-10','นางสาวอรุณ อสม.','ติดตามอาการ','อาการดีขึ้นเล็กน้อย','2026-04-10 10:00:00'),
  (hh4, p_bed1,'2026-05-15','นายสมพงษ์ เจ้าหน้าที่','เยี่ยมผู้ป่วยติดเตียง','ประเมินสภาพร่างกาย ส่งต่อพยาบาล','2026-05-15 09:00:00'),
  (hh2, p_old1,'2026-05-20','นางสาวอรุณ อสม.','เยี่ยมผู้สูงอายุป่วย','รับยาต่อเนื่อง ครอบครัวดูแลดี','2026-05-20 11:00:00'),
  (hh15,NULL,  '2026-04-25','นายสมชัย อสม.','เยี่ยมผู้สูงอายุ','ผู้สูงอายุสุขภาพดี ใช้ชีวิตได้ปกติ','2026-04-25 10:30:00'),
  (hh19,NULL,  '2026-04-05','นางสาวอรุณ อสม.','เยี่ยมผู้สูงอายุป่วย','ติดตามการรับยา','2026-04-05 09:00:00'),
  (hh5, NULL,  '2026-03-18','นายสมชัย อสม.','คัดกรองสุขภาพ','วัดความดัน ปกติ','2026-03-18 13:00:00'),
  (hh10,NULL,  '2026-03-22','นายสมพงษ์ เจ้าหน้าที่','สำรวจรายได้','เก็บข้อมูลเศรษฐกิจ','2026-03-22 14:00:00'),
  (hh12,NULL,  '2026-03-10','นางสาวอรุณ อสม.','เยี่ยมผู้ป่วย','จัดหาอุปกรณ์ช่วยเดิน','2026-03-10 10:00:00'),
  (hh7, NULL,  '2026-02-28','นายสมชัย อสม.','เยี่ยมผู้สูงอายุ','สุขภาพดี รับยาต่อเนื่อง','2026-02-28 09:30:00'),
  (hh1, NULL,  '2026-05-25','นายสมพงษ์ เจ้าหน้าที่','สำรวจครัวเรือน','เก็บข้อมูลทั่วไป','2026-05-25 10:00:00'),
  (hh3, NULL,  '2026-05-10','นางสาวอรุณ อสม.','ติดตามเด็กแรกเกิด','พัฒนาการปกติ น้ำหนักดี','2026-05-10 11:00:00'),
  (hh13,NULL,  '2026-05-18','นายสมชัย อสม.','ติดตามเด็กเล็ก','สุขภาพดี วัคซีนครบ','2026-05-18 10:00:00'),
  (hh6, NULL,  '2026-02-15','นายสมพงษ์ เจ้าหน้าที่','เยี่ยมชุมชน','รับทราบปัญหาถนน','2026-02-15 13:30:00'),
  (hh20,NULL,  '2026-01-30','นายสมชัย อสม.','คัดกรองสุขภาพ','ตรวจสุขภาพประจำปี ปกติทุกราย','2026-01-30 09:00:00');

-- ── 6. Training Events ─────────────────────────────────────
INSERT INTO training_event (village_id,training_name,training_type,organizer,start_date,end_date,location,description,created_at)
VALUES
  (5,'การทำปุ๋ยหมักชีวภาพ','เกษตรกรรม','กรมส่งเสริมการเกษตร','2026-07-15','2026-07-15','ศาลากลางหมู่บ้าน','อบรมทำปุ๋ยหมักเพื่อลดต้นทุน','2026-05-01 09:00:00'),
  (5,'การดูแลผู้สูงอายุ/ผู้ป่วยติดบ้าน','สาธารณสุข','สาธารณสุขอำเภอ','2026-08-05','2026-08-06','รพ.สต.','เทคนิคการดูแลผู้ป่วยที่บ้าน สำหรับ อสม.','2026-05-15 10:00:00'),
  (5,'การจัดการขยะในชุมชน','สิ่งแวดล้อม','อบต.','2025-12-10','2025-12-10','ศาลากลางหมู่บ้าน','การคัดแยกขยะและสร้างรายได้','2025-11-01 09:00:00');

-- ── 7. Household Economic (รายได้ปี 2021–2025) ─────────────
INSERT INTO household_economic (household_id,income_total_per_month,debt_total,debt_type,poor_flag,record_date,created_at)
VALUES
  -- 2021
  (hh1,  12000, 50000,'กู้ยืมธนาคาร',false,'2021-12-31','2021-12-31 10:00:00'),
  (hh3,   9000, 20000,'กู้ยืมธนาคาร',false,'2021-12-31','2021-12-31 10:00:00'),
  (hh10,  8500, 30000,'กู้ยืมธนาคาร',false,'2021-12-31','2021-12-31 10:00:00'),
  (hh12,  3500, 15000,'หนี้นอกระบบ', true, '2021-12-31','2021-12-31 10:00:00'),
  -- 2022
  (hh1,  13000, 45000,'กู้ยืมธนาคาร',false,'2022-12-31','2022-12-31 10:00:00'),
  (hh3,  10000, 18000,'กู้ยืมธนาคาร',false,'2022-12-31','2022-12-31 10:00:00'),
  (hh5,  20500,     0, NULL,           false,'2022-12-31','2022-12-31 10:00:00'),
  (hh8,  23000, 60000,'กู้ยืมธนาคาร',false,'2022-12-31','2022-12-31 10:00:00'),
  (hh12,  4000, 12000,'หนี้นอกระบบ', false,'2022-12-31','2022-12-31 10:00:00'),
  -- 2023
  (hh1,  14000, 40000,'กู้ยืมธนาคาร',false,'2023-12-31','2023-12-31 10:00:00'),
  (hh6,  27000,     0, NULL,           false,'2023-12-31','2023-12-31 10:00:00'),
  (hh8,  25000, 50000,'กู้ยืมธนาคาร',false,'2023-12-31','2023-12-31 10:00:00'),
  (hh13, 30000,100000,'กู้ยืมธนาคาร',false,'2023-12-31','2023-12-31 10:00:00'),
  (hh17, 11000, 25000,'กู้ยืมธนาคาร',false,'2023-12-31','2023-12-31 10:00:00'),
  -- 2024
  (hh1,  15000, 35000,'กู้ยืมธนาคาร',false,'2024-12-31','2024-12-31 10:00:00'),
  (hh6,  29000,     0, NULL,           false,'2024-12-31','2024-12-31 10:00:00'),
  (hh8,  26000, 40000,'กู้ยืมธนาคาร',false,'2024-12-31','2024-12-31 10:00:00'),
  (hh13, 32000, 80000,'กู้ยืมธนาคาร',false,'2024-12-31','2024-12-31 10:00:00'),
  (hh20, 24000,     0, NULL,           false,'2024-12-31','2024-12-31 10:00:00'),
  -- 2025
  (hh1,  16000, 30000,'กู้ยืมธนาคาร',false,'2025-12-31','2025-12-31 10:00:00'),
  (hh6,  30000,     0, NULL,           false,'2025-12-31','2025-12-31 10:00:00'),
  (hh8,  28000, 30000,'กู้ยืมธนาคาร',false,'2025-12-31','2025-12-31 10:00:00'),
  (hh13, 35000, 60000,'กู้ยืมธนาคาร',false,'2025-12-31','2025-12-31 10:00:00'),
  (hh20, 26000,     0, NULL,           false,'2025-12-31','2025-12-31 10:00:00');

END $$;

-- ============================================================
--  สรุปข้อมูล Dashboard (village_id = 5):
--  ครัวเรือน: 20 | ประชากร: ~58 คน
--  เด็ก 0-3 ปี: 4 | ผู้สูงอายุ: 10 | ผู้พิการ: 3 | ผู้ป่วยติดเตียง: 2
--  ครัวเรือนยากจน: 1 | อินเทอร์เน็ต: 14/20 = 70%
--  ปัญหาชุมชน: 10 (เปิด 5 / ดำเนินการ 3 / แก้แล้ว 2)
--  เยี่ยมบ้าน: 15 ครั้ง | การอบรม: 3 รายการ
--  รายได้ชุมชน: ปี 2021-2025 (กราฟ area ขึ้น trend สูงขึ้นทุกปี)
-- ============================================================
