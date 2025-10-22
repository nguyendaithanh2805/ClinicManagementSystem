-- 1. CREATE DATABASE
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ClinicDB')
    CREATE DATABASE ClinicDB;
GO
USE ClinicDB;
GO

-- 2. CREATE TABLE
CREATE TABLE MedicalService (
	Id				INT				IDENTITY(1,1),
	SpecialtyId		INT				NOT NULL,
	Name			NVARCHAR(200)	NOT NULL,
	Cost			DECIMAL(15,0)	NOT NULL,
	CONSTRAINT PK_MedicalService PRIMARY KEY (Id)
);
GO

CREATE TABLE Specialty (
	Id				INT				IDENTITY(1,1),
	Name			NVARCHAR(200)	NOT NULL,
	CONSTRAINT PK_Specialty PRIMARY KEY (Id)
);
GO

CREATE TABLE Staff (
	Id				INT				IDENTITY(1,1),
	AccountId		INT				NOT NULL	UNIQUE, ---- 1-1
	SpecialtyId		INT				NULL,
	FullName		NVARCHAR(200)	NULL,
	Expertise		NVARCHAR(200)	NULL,
	CONSTRAINT PK_Staff PRIMARY KEY (Id)
);
GO

CREATE TABLE Patient (
	Id				INT				IDENTITY(1,1),
	AccountId		INT				NOT NULL	UNIQUE, ---- 1-1
	FullName		NVARCHAR(200)	NOT NULL,
	DateOfBirth		DATE			NULL,
	Address			NVARCHAR(300)	NULL,
	CONSTRAINT PK_Patient PRIMARY KEY (Id),
);
GO

/* Status
Pending = 0,      // Chờ xác nhận
Confirmed = 1,    // Đã xác nhận
CheckedIn = 2,    // Bệnh nhân đã đến
InProgress = 3,   // Đang khám
Completed = 4,    // Đã hoàn thành
Cancelled = 5,    // Đã hủy
NoShow = 6        // Không đến
*/
CREATE TABLE Appointment (
	Id						INT		IDENTITY(1,1),
	PatientId				INT		NOT NULL,
	StaffId					INT		NULL, ---- Vừa đặt lịch chưa cần bác sĩ
	MedicalServiceId		INT		NOT NULL,
	PatientMedicalRecordId	INT		NULL, ---- Bệnh nhân chưa đến thì không cần tạo hồ sơ bệnh án
	AppointmentDate			Date	NOT NULL,
	AppointmentTime			Time	NOT NULL,
	Status					INT		NOT NULL,
	IsRevisit				BIT		NOT NULL, -- 0: Không tái khám, 1: Cần tái khám
	CONSTRAINT PK_Appointment PRIMARY KEY (Id)
);
GO

CREATE TABLE Invoice (
	Id							INT				IDENTITY(1,1),
	PatientMedicalRecordId		INT				NOT NULL,
	PaymentDate					DATETIME		NULL,
	TotalAmount					DECIMAL(15,0)	NOT NULL,
	Status						BIT				NOT NULL,
	CONSTRAINT PK_Invoice PRIMARY KEY (Id)
);
GO

CREATE TABLE Account (
	Id				INT				IDENTITY(1,1),
	RoleId			INT				NOT NULL,
	Username		NVARCHAR(200)	NOT NULL,
	Password		NVARCHAR(200)	NOT NULL,
	PhoneNumber		NVARCHAR(50)	NULL,
	Email			NVARCHAR(200)	NULL,
	CONSTRAINT PK_Account PRIMARY KEY (Id)
);
GO

CREATE TABLE Medicine (
	Id					INT				IDENTITY(1,1),
	Name				NVARCHAR(200)	NOT NULL,
	Category			NVARCHAR(100)	NOT NULL,
	Description			NVARCHAR(500)	NULL,
	Unit				NVARCHAR(50)	NOT NULL,
	Contraindications	NVARCHAR(500)	NULL,
	Interactions		NVARCHAR(500)	NULL,
	Price				DECIMAL(18,2)	NOT NULL,
	CONSTRAINT PK_Medicine PRIMARY KEY (Id)
);
GO

CREATE TABLE PatientMedicalRecord (
	Id					INT				IDENTITY(1,1),
	PatientId			INT				NOT NULL,
	StaffId				INT				NOT NULL,
	Diagnosis			NVARCHAR(500)	NULL,
	TreatmentMethod		NVARCHAR(500)	NULL,
	RequiresTest		BIT				NOT NULL,
	CreateAt			DATETIME		NOT NULL,
	Status				BIT				NOT NULL,
	CONSTRAINT PK_PatientMedicalRecord PRIMARY KEY (Id)
);
GO

CREATE TABLE Prescription (
	Id						INT				IDENTITY(1,1),
	PatientMedicalRecordId	INT				NOT NULL,
	PrescriptionDate		DATETIME		NOT NULL,
	CONSTRAINT PK_Prescription PRIMARY KEY (Id)
);
GO

CREATE TABLE PrescriptionDetail (
	PrescriptionId	INT				NOT NULL,
	MedicineId		INT				NOT NULL,
	Quantity		INT				NOT NULL,
	Dosage			NVARCHAR(200)	NULL,
	Frequency		NVARCHAR(200)	NULL,
	Amount			DECIMAL(15,0)	NOT NULL,
	CONSTRAINT PK_PrescriptionDetail PRIMARY KEY (PrescriptionId, MedicineId)
);
GO

CREATE TABLE [Role] (
	Id		INT				IDENTITY(1,1),
	Name	NVARCHAR(100)	NOT NULL,
	CONSTRAINT PK_Role PRIMARY KEY (Id)
);
GO

CREATE TABLE Symptom (
	Id						INT				IDENTITY(1,1),
	PatientMedicalRecordId	INT				NOT NULL,
	Name					NVARCHAR(200)	NOT NULL,
	CONSTRAINT PK_Symptom PRIMARY KEY (Id)
);
GO

CREATE TABLE TestResult (
	Id						INT				IDENTITY(1,1),
	PatientMedicalRecordId	INT				NOT NULL,
	StaffId					INT				NOT NULL,
	Name					NVARCHAR(200)	NOT NULL,
	Image					NVARCHAR(300)	NULL,
	Description				NVARCHAR(500)	NULL,
	CreatedAt				DATETIME		NOT NULL,
	CONSTRAINT PK_TestResult PRIMARY KEY (Id)
);
GO

-- 3. CREATE RELATIONSHIP
ALTER TABLE MedicalService
ADD CONSTRAINT FK_MedicalService_Specialty FOREIGN KEY (specialtyId) REFERENCES Specialty(Id);
GO

ALTER TABLE Staff
ADD CONSTRAINT FK_Staff_Account FOREIGN KEY (AccountId) REFERENCES Account(Id);
GO

ALTER TABLE Staff
ADD CONSTRAINT FK_Staff_Specialty FOREIGN KEY (SpecialtyId) REFERENCES Specialty(Id);
GO

ALTER TABLE Patient
ADD CONSTRAINT FK_Patient_Account FOREIGN KEY (AccountId) REFERENCES Account(Id)
GO

ALTER TABLE Account
ADD CONSTRAINT FK_Account_Role FOREIGN KEY (RoleId) REFERENCES Role(Id);
GO

ALTER TABLE Appointment
ADD CONSTRAINT FK_Appointment_Patient FOREIGN KEY (PatientId) REFERENCES Patient(Id)
GO

ALTER TABLE Appointment
ADD CONSTRAINT FK_Appointment_Staff FOREIGN KEY (StaffId) REFERENCES Staff(Id);
GO

ALTER TABLE Appointment
ADD CONSTRAINT FK_Appointment_MedicalService FOREIGN KEY (MedicalServiceId) REFERENCES MedicalService(Id);
GO

ALTER TABLE Appointment
ADD CONSTRAINT FK_Appointment_PatientMedicalRecord FOREIGN KEY (PatientMedicalRecordId) REFERENCES PatientMedicalRecord(Id);
GO

ALTER TABLE Invoice
ADD CONSTRAINT FK_Invoice_PatientMedicalRecord FOREIGN KEY (PatientMedicalRecordId) REFERENCES PatientMedicalRecord(Id)
GO

ALTER TABLE Symptom
ADD CONSTRAINT FK_Symptom_PatientMedicalRecord FOREIGN KEY (PatientMedicalRecordId) REFERENCES PatientMedicalRecord(Id)
GO

ALTER TABLE TestResult
ADD CONSTRAINT FK_TestResult_PatientMedicalRecord FOREIGN KEY (PatientMedicalRecordId) REFERENCES PatientMedicalRecord(Id)
GO

ALTER TABLE TestResult
ADD CONSTRAINT FK_TestResult_Staff FOREIGN KEY (StaffId) REFERENCES Staff(Id);
GO

ALTER TABLE PatientMedicalRecord
ADD CONSTRAINT FK_PatientMedicalRecord_Patient FOREIGN KEY (PatientId) REFERENCES Patient(Id)
GO

ALTER TABLE PatientMedicalRecord
ADD CONSTRAINT FK_PatientMedicalRecord_Staff FOREIGN KEY (StaffId) REFERENCES Staff(Id);
GO

ALTER TABLE Prescription
ADD CONSTRAINT FK_Prescription_PatientMedicalRecord FOREIGN KEY (PatientMedicalRecordId) REFERENCES PatientMedicalRecord(Id)
GO

ALTER TABLE PrescriptionDetail
ADD CONSTRAINT FK_PrescriptionDetail_Prescription FOREIGN KEY (PrescriptionId) REFERENCES Prescription(Id)
GO

ALTER TABLE PrescriptionDetail
ADD CONSTRAINT FK_PrescriptionDetail_Medicine FOREIGN KEY (MedicineId) REFERENCES Medicine(Id)
GO

-- 4. Insert Data
INSERT INTO [Role] (Name) 
VALUES 
    (N'Admin'),           -- 1
    (N'Patient'),         -- 2
    (N'Doctor'),          -- 3
    (N'Receptionist'),    -- 4
    (N'LabTechnician');   -- 5
GO

---- Pass: thanh1111
INSERT INTO Account (RoleId, Username, Password, PhoneNumber, Email)
VALUES 
    (1, N'Admin', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0123456789', N'admin@clinic.com'); -- ID 1
GO

INSERT INTO Specialty (Name)
VALUES 
    (N'Nội khoa'),       -- ID 1
    (N'Ngoại khoa'),     -- ID 2
    (N'Nhi khoa'),       -- ID 3
    (N'Da liễu');        -- ID 4
GO

-------------------------------------------------
-- 1. TẠO TÀI KHOẢN CHO NHÂN VIÊN VÀ BỆNH NHÂN
-------------------------------------------------
INSERT INTO Account (RoleId, Username, Password, PhoneNumber, Email)
VALUES 
    -- Staff Accounts
    (3, N'doctor1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0987654321', N'doctor_noi1@clinic.com'),  -- ID 2
    (3, N'doctor2', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0987654322', N'doctor_da2@clinic.com'),  -- ID 3
    (4, N'receptionist1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0987654323', N'receptionist1@clinic.com'), -- ID 4
    (5, N'labtech1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0987654324', N'labtech1@clinic.com'),      -- ID 5
    
    -- Patient Accounts
    (2, N'patient1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901000111', N'patient1@email.com'), -- ID 6
    (2, N'patient2', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901000222', N'patient2@email.com'), -- ID 7
    (2, N'patient3', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901000333', N'patient3@email.com'), -- ID 8
    (2, N'patient4', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901000444', N'patient4@email.com'), -- ID 9
    (2, N'patient5', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901000555', N'patient5@email.com'); -- ID 10
GO

-------------------------------------------------
-- 2. TẠO HỒ SƠ NHÂN VIÊN (STAFF)
-------------------------------------------------
INSERT INTO Staff (AccountId, SpecialtyId, FullName, Expertise)
VALUES 
    (2, 1, N'Nguyễn Thị Bình', N'Chuyên nội khoa tổng quát'),    -- ID 1 (Doctor 1 - Nội khoa)
    (3, 4, N'Phạm Văn Cường', N'Chuyên gia Da liễu'),         -- ID 2 (Doctor 2 - Da liễu)
    (4, NULL, N'Trần Thị Lễ Tân', N'Lễ tân'),                 -- ID 3 (Receptionist 1)
    (5, NULL, N'Lý Văn Xét Nghiệm', N'Kỹ thuật viên');         -- ID 4 (Lab Tech 1)
GO

-------------------------------------------------
-- 3. TẠO HỒ SƠ BỆNH NHÂN (PATIENT)
-------------------------------------------------
INSERT INTO Patient (AccountId, FullName, DateOfBirth, Address)
VALUES
    (6, N'Trần Văn An', '1990-05-15', N'123 Đường ABC, TP.HCM'),     -- ID 1
    (7, N'Nguyễn Thị Bích', '1985-11-20', N'456 Đường DEF, Hà Nội'),  -- ID 2
    (8, N'Lê Minh Cường', '2000-01-30', N'789 Đường GHI, Đà Nẵng'),   -- ID 3
    (9, N'Phạm Thu Duyên', '1995-07-10', N'101 Đường JKL, Cần Thơ'), -- ID 4
    (10, N'Võ Hùng Em', '1978-03-25', N'202 Đường MNO, Bình Dương'); -- ID 5
GO

-------------------------------------------------
-- 4. TẠO DỊCH VỤ Y TẾ (MEDICAL SERVICE)
-------------------------------------------------
INSERT INTO MedicalService (SpecialtyId, Name, Cost)
VALUES
    (1, N'Khám nội khoa tổng quát', 200000),  -- ID 1
    (4, N'Khám da liễu', 250000),             -- ID 2
    (1, N'Xét nghiệm máu tổng quát', 350000), -- ID 3
    (3, N'Khám nhi tổng quát', 220000);        -- ID 4
GO

-------------------------------------------------
-- 5. TẠO DANH SÁCH THUỐC (MEDICINE)
-------------------------------------------------
INSERT INTO Medicine (Name, Category, Description, Unit, Contraindications, Interactions, Price)
VALUES
    (N'Paracetamol 500mg', N'Giảm đau, Hạ sốt', N'Giảm đau thông thường, hạ sốt', N'Viên', N'Người mẫn cảm với Paracetamol, bệnh gan nặng', N'Rượu, thuốc chống đông máu', 1500.00), -- ID 1
    (N'Amoxicillin 500mg', N'Kháng sinh', N'Kháng sinh nhóm Penicillin', N'Viên', N'Dị ứng Penicillin', N'Thuốc Gout (Allopurinol)', 2500.00), -- ID 2
    (N'Omeprazole 20mg', N'Dạ dày', N'Ức chế bơm proton, giảm tiết acid', N'Viên', N'Người mẫn cảm với Omeprazole', N'Diazepam, Warfarin', 3000.00), -- ID 3
    (N'Loratadine 10mg', N'Dị ứng', N'Kháng Histamin H1', N'Viên', N'Quá mẫn với thành phần', N'Cimetidin, Ketoconazol', 2000.00); -- ID 4
GO

-------------------------------------------------
-- KỊCH BẢN MẪU (Giả sử hôm nay là 2025-10-22)
-------------------------------------------------

-- === KỊCH BẢN 1: ĐÃ HOÀN THÀNH (Status 4) ===
-- Bệnh nhân: Trần Văn An (Patient ID 1)
-- Bác sĩ: Nguyễn Thị Bình (Staff ID 1)
-- Ngày khám: 2025-10-10
-- Ghi chú: Có xét nghiệm, có đơn thuốc, đã thanh toán.

-- Hồ sơ bệnh án
SET IDENTITY_INSERT PatientMedicalRecord ON;
INSERT INTO PatientMedicalRecord (Id, PatientId, StaffId, Diagnosis, TreatmentMethod, RequiresTest, CreateAt, Status)
VALUES (1, 1, 1, N'Viêm dạ dày cấp', N'Uống thuốc giảm acid và thay đổi chế độ ăn', 1, '2025-10-10 09:00:00', 1); -- PMR ID 1, Status 1 = Đã hoàn thành
SET IDENTITY_INSERT PatientMedicalRecord OFF;
GO

-- Lịch hẹn tương ứng
INSERT INTO Appointment (PatientId, StaffId, MedicalServiceId, PatientMedicalRecordId, AppointmentDate, AppointmentTime, Status, IsRevisit)
VALUES (1, 1, 1, 1, '2025-10-10', '09:00:00', 4, 0); -- Appointment ID 1, Status 4 = Completed

-- Triệu chứng
INSERT INTO Symptom (PatientMedicalRecordId, Name)
VALUES (1, N'Đau thượng vị'), (1, N'Ợ nóng');
GO

-- Kết quả xét nghiệm
INSERT INTO TestResult (PatientMedicalRecordId, StaffId, Name, Image, Description, CreatedAt)
VALUES (1, 4, N'Xét nghiệm máu', N'test_results/blood_test_01.jpg', N'Chỉ số acid Uric hơi cao', '2025-10-10 10:00:00'); -- Staff ID 4 = LabTech
GO

-- Đơn thuốc
SET IDENTITY_INSERT Prescription ON;
INSERT INTO Prescription (Id, PatientMedicalRecordId, PrescriptionDate)
VALUES (1, 1, '2025-10-10 09:30:00'); -- Prescription ID 1
SET IDENTITY_INSERT Prescription OFF;
GO

-- Chi tiết đơn thuốc
INSERT INTO PrescriptionDetail (PrescriptionId, MedicineId, Quantity, Dosage, Frequency, Amount)
VALUES (1, 3, 20, N'1 viên', N'Uống trước ăn sáng 30 phút', 60000); -- Omeprazole (Medicine ID 3)
GO

-- Hóa đơn
INSERT INTO Invoice (PatientMedicalRecordId, PaymentDate, TotalAmount, Status)
-- Total = Khám (200k) + Thuốc (60k) + XN (350k) = 610k (Giả định dịch vụ XN đã được thêm vào)
VALUES (1, '2025-10-10 11:00:00', 610000, 1); -- Status 1 = Đã thanh toán
GO

-------------------------------------------------

-- === KỊCH BẢN 2: ĐANG KHÁM (Status 3) ===
-- Bệnh nhân: Nguyễn Thị Bích (Patient ID 2)
-- Bác sĩ: Phạm Văn Cường (Staff ID 2)
-- Ngày khám: 2025-10-22 (Hôm nay)
-- Ghi chú: Đã tạo hồ sơ, có triệu chứng, chưa có đơn thuốc/XN/hoá đơn.

-- Hồ sơ bệnh án
SET IDENTITY_INSERT PatientMedicalRecord ON;
INSERT INTO PatientMedicalRecord (Id, PatientId, StaffId, Diagnosis, TreatmentMethod, RequiresTest, CreateAt, Status)
VALUES (2, 2, 2, NULL, NULL, 0, '2025-10-22 08:30:00', 0); -- PMR ID 2, Status 0 = Chưa hoàn thành
SET IDENTITY_INSERT PatientMedicalRecord OFF;
GO

-- Lịch hẹn tương ứng
INSERT INTO Appointment (PatientId, StaffId, MedicalServiceId, PatientMedicalRecordId, AppointmentDate, AppointmentTime, Status, IsRevisit)
VALUES (2, 2, 2, 2, '2025-10-22', '08:30:00', 3, 0); -- Appointment ID 2, Status 3 = InProgress

-- Triệu chứng
INSERT INTO Symptom (PatientMedicalRecordId, Name)
VALUES (2, N'Phát ban đỏ'), (2, N'Ngứa');
GO

-------------------------------------------------

-- === KỊCH BẢN 3: BỆNH NHÂN ĐÃ ĐẾN (Status 2) ===
-- Bệnh nhân: Lê Minh Cường (Patient ID 3)
-- Bác sĩ dự kiến: Nguyễn Thị Bình (Staff ID 1)
-- Ngày hẹn: 2025-10-22 (Hôm nay)
-- Ghi chú: Đã check-in, đang chờ khám. Chưa có hồ sơ bệnh án.

-- Hồ sơ bệnh án
SET IDENTITY_INSERT PatientMedicalRecord ON;
INSERT INTO PatientMedicalRecord (Id, PatientId, StaffId, Diagnosis, TreatmentMethod, RequiresTest, CreateAt, Status)
VALUES (3, 3, 1, NULL, NULL, 0, '2025-10-22 08:30:00', 0); -- PMR ID 2, Status 0 = Chưa hoàn thành
SET IDENTITY_INSERT PatientMedicalRecord OFF;
GO

-- Lịch hẹn tương ứng
INSERT INTO Appointment (PatientId, StaffId, MedicalServiceId, PatientMedicalRecordId, AppointmentDate, AppointmentTime, Status, IsRevisit)
VALUES (3, 1, 1, 3, '2025-10-22', '09:30:00', 2, 0); -- Appointment ID 3, Status 2 = CheckedIn
GO

-------------------------------------------------

-- === KỊCH BẢN 4: ĐÃ XÁC NHẬN (Status 1) ===
-- Bệnh nhân: Phạm Thu Duyên (Patient ID 4)
-- Bác sĩ: Nguyễn Thị Bình (Staff ID 1)
-- Ngày hẹn: 2025-10-23 (Ngày mai)
-- Ghi chú: Lịch hẹn đã được xác nhận.

-- Lịch hẹn tương ứng
INSERT INTO Appointment (PatientId, StaffId, MedicalServiceId, PatientMedicalRecordId, AppointmentDate, AppointmentTime, Status, IsRevisit)
VALUES (4, 1, 1, NULL, '2025-10-23', '10:00:00', 1, 0); -- Appointment ID 4, Status 1 = Confirmed
GO

-------------------------------------------------

-- === KỊCH BẢN 5: CHỜ XÁC NHẬN (Status 0) ===
-- Bệnh nhân: Võ Hùng Em (Patient ID 5)
-- Bác sĩ: Chưa phân công (Staff ID = NULL)
-- Ngày hẹn: 2025-10-24
-- Ghi chú: Lịch mới đặt, chờ lễ tân xử lý.

-- Lịch hẹn tương ứng
INSERT INTO Appointment (PatientId, StaffId, MedicalServiceId, PatientMedicalRecordId, AppointmentDate, AppointmentTime, Status, IsRevisit)
VALUES (5, NULL, 2, NULL, '2025-10-24', '14:00:00', 0, 0); -- Appointment ID 5, Status 0 = Pending
GO

-------------------------------------------------

-- === KỊCH BẢN 6: ĐÃ HỦY (Status 5) ===
-- Bệnh nhân: Trần Văn An (Patient ID 1)
-- Bác sĩ: Phạm Văn Cường (Staff ID 2)
-- Ngày hẹn: 2025-10-15 (Đã qua)
-- Ghi chú: Bệnh nhân đã hủy lịch hẹn này.

-- Lịch hẹn tương ứng
INSERT INTO Appointment (PatientId, StaffId, MedicalServiceId, PatientMedicalRecordId, AppointmentDate, AppointmentTime, Status, IsRevisit)
VALUES (1, 2, 2, NULL, '2025-10-15', '11:00:00', 5, 0); -- Appointment ID 6, Status 5 = Cancelled
GO

-------------------------------------------------

-- === KỊCH BẢN 7: KHÔNG ĐẾN (Status 6) ===
-- Bệnh nhân: Nguyễn Thị Bích (Patient ID 2)
-- Bác sĩ: Nguyễn Thị Bình (Staff ID 1)
-- Ngày hẹn: 2025-10-05 (Đã qua)
-- Ghi chú: Bệnh nhân đã bỏ lỡ lịch hẹn này.

-- Lịch hẹn tương ứng
INSERT INTO Appointment (PatientId, StaffId, MedicalServiceId, PatientMedicalRecordId, AppointmentDate, AppointmentTime, Status, IsRevisit)
VALUES (2, 1, 1, NULL, '2025-10-05', '15:00:00', 6, 0); -- Appointment ID 7, Status 6 = NoShow
GO

-------------------------------------------------

-- === KỊCH BẢN 8: TÁI KHÁM (Status 1, IsRevisit = 1) ===
-- Bệnh nhân: Trần Văn An (Patient ID 1) - Liên quan đến Kịch bản 1
-- Bác sĩ: Nguyễn Thị Bình (Staff ID 1)
-- Ngày hẹn: 2025-10-25
-- Ghi chú: Lịch hẹn tái khám đã được xác nhận.

-- Lịch hẹn tương ứng
INSERT INTO Appointment (PatientId, StaffId, MedicalServiceId, PatientMedicalRecordId, AppointmentDate, AppointmentTime, Status, IsRevisit)
VALUES (1, 1, 1, NULL, '2025-10-25', '09:00:00', 1, 1); -- Appointment ID 8, Status 1 = Confirmed, IsRevisit = 1
GO