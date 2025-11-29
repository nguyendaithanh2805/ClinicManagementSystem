-- 1. CREATE DATABASE
USE master;
GO

IF DB_ID('ClinicDB') IS NOT NULL
BEGIN
    ALTER DATABASE ClinicDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ClinicDB;
END;
GO

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
	PatientMedicalRecordId	INT		NULL,
	AppointmentDate			Date	NOT NULL,
	AppointmentTime			Time	NOT NULL,
	Status					INT		NOT NULL,
	Revisit					INT		NOT NULL, -- 0: Không tái khám, 1: Cần tái khám, 2: Hoàn thành tái khám
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
	AppointmentId			INT				NOT NULL,
	PrescriptionDate		DATETIME		NOT NULL,
	IsCompleted				BIT				NOT NULL,
	CONSTRAINT PK_Prescription PRIMARY KEY (Id)
);
GO

CREATE TABLE PrescriptionDetail (
	Id				INT				IDENTITY(1,1), ---- Ở đây dùng thêm Id làm khóa chính vì có thể kê 1 loại thuốc nhiều lần cho đơn thuốc (tái khám)
	PrescriptionId	INT				NOT NULL,
	MedicineId		INT				NOT NULL,
	Quantity		INT				NOT NULL,
	Dosage			NVARCHAR(200)	NULL,
	Frequency		NVARCHAR(200)	NULL,
	Amount			DECIMAL(15,0)	NOT NULL,
	CONSTRAINT PK_PrescriptionDetail PRIMARY KEY (Id)
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

CREATE TABLE [Notification] (
	Id			INT				IDENTITY(1,1),
	AccountId	INT				NOT NULL,
	Title		NVARCHAR(200)	NOT NULL,
	Message		NVARCHAR(255)	NOT NULL,
	Type		NVARCHAR(200)	NOT NULL,
	CreatedAt	DATETIME		NOT NULL,
	IsRead		BIT				NOT NULL DEFAULT 0
	CONSTRAINT PK_Notification PRIMARY KEY (Id)
);
GO

-- 3. CREATE RELATIONSHIP
ALTER TABLE MedicalService
ADD CONSTRAINT FK_MedicalService_Specialty FOREIGN KEY (specialtyId) REFERENCES Specialty(Id);
GO

ALTER TABLE [Notification]
ADD CONSTRAINT FK_Notification_Account FOREIGN KEY (AccountId) REFERENCES Account(Id);
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

ALTER TABLE Prescription
ADD CONSTRAINT FK_Prescription_Appointment FOREIGN KEY (AppointmentId) REFERENCES Appointment(Id)
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

  INSERT INTO Appointment (
    PatientId,
    StaffId,
    MedicalServiceId,
    PatientMedicalRecordId,
    AppointmentDate,
    AppointmentTime,
    Status,
    Revisit
)
VALUES
(1, NULL, 2, NULL, '2025-10-24', '14:30:00', 0, 0),
(1, 1, 4, NULL, '2025-10-29', '13:30:00', 1, 0),
(2, 1, 1, NULL, '2025-10-24', '15:30:00', 1, 0),
(2, NULL, 2, NULL, '2025-10-29', '15:30:00', 5, 0);
