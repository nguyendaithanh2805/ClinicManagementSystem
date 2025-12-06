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

CREATE TABLE PaymentTransaction (
	Id				INT				IDENTITY(1,1),
	InvoiceId		INT				NOT NULL,
	TransactionNo	NVARCHAR(255)	NOT NULL,
	Amount			DECIMAL(15,0)	NOT NULL,
	Status			NVARCHAR(100)	NOT NULL,
	CreatedAt		DATETIME		NOT NULL,
	CONSTRAINT PK_PaymentTransaction PRIMARY KEY (Id)
);
GO

-- 3. CREATE RELATIONSHIP
ALTER TABLE MedicalService
ADD CONSTRAINT FK_MedicalService_Specialty FOREIGN KEY (specialtyId) REFERENCES Specialty(Id);
GO

ALTER TABLE [Notification]
ADD CONSTRAINT FK_Notification_Account FOREIGN KEY (AccountId) REFERENCES Account(Id);
GO

ALTER TABLE PaymentTransaction
ADD CONSTRAINT FK_PaymentTransaction_Invoice FOREIGN KEY (InvoiceId) REFERENCES Invoice(Id);
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
INSERT [dbo].[Specialty] ([Name]) VALUES (N'Nội khoa')
INSERT [dbo].[Specialty] ([Name]) VALUES (N'Ngoại khoa')
INSERT [dbo].[Specialty] ([Name]) VALUES (N'Nhi khoa')
INSERT [dbo].[Specialty] ([Name]) VALUES (N'Da liễu')
GO

INSERT [dbo].[MedicalService] ([SpecialtyId], [Name], [Cost]) VALUES (1, N'Khám nội khoa tổng quát', CAST(200000 AS Decimal(15, 0)))
INSERT [dbo].[MedicalService] ([SpecialtyId], [Name], [Cost]) VALUES (4, N'Khám da liễu', CAST(250000 AS Decimal(15, 0)))
INSERT [dbo].[MedicalService] ([SpecialtyId], [Name], [Cost]) VALUES (1, N'Xét nghiệm máu tổng quát', CAST(350000 AS Decimal(15, 0)))
INSERT [dbo].[MedicalService] ([SpecialtyId], [Name], [Cost]) VALUES (3, N'Khám nhi tổng quát', CAST(220000 AS Decimal(15, 0)))
GO

INSERT [dbo].[Role] ([Name]) VALUES (N'Admin')
INSERT [dbo].[Role] ([Name]) VALUES (N'Patient')
INSERT [dbo].[Role] ([Name]) VALUES (N'Doctor')
INSERT [dbo].[Role] ([Name]) VALUES (N'Receptionist')
INSERT [dbo].[Role] ([Name]) VALUES (N'LabTechnician')
GO

INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (1, N'Admin', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0123456789', N'admin@clinic.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (3, N'doctor1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0987654321', N'doctor_noi1@clinic.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (3, N'doctor2', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0987654322', N'doctor_da2@clinic.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (4, N'receptionist1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0987654323', N'receptionist1@clinic.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (5, N'labtech1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0987654324', N'labtech1@clinic.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (2, N'patient1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901000111', N'patient1@email.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (2, N'patient2', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901000222', N'patient2@email.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (2, N'patient3', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901000333', N'patient3@email.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (2, N'patient4', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901000444', N'patient4@email.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (2, N'patient5', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901000555', N'patient5@email.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (2, N'thanh1', N'AQAAAAIAAYagAAAAEPZoFG/z+kG8juPIryTjmUnKirKIPpN0jsywYPaY1xlcbK72nI66yAUeBd8vJxUx5w==', N'377062563', N'thanhdaiu443@gmail.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (2, N'thanh2', N'AQAAAAIAAYagAAAAEP5gUWWi5G0QkjJsDL6M23TXrxRHsCipRKRm8U757qJy3CVuFllRQA9pYZ6HmSiVBw==', N'377062562', N'thanhdaiu443@gmail.com')
INSERT [dbo].[Account] ([RoleId], [Username], [Password], [PhoneNumber], [Email]) VALUES (2, N'thanh', N'AQAAAAIAAYagAAAAEPKEj8NFIFEghyv0KA+id6kANGukpSOXCx/nx0hZVHsu7PCZswD+M7jLxCc+UFnbQg==', N'0377062956', N'2200003132@gmail.com')
GO

INSERT [dbo].[Staff] ([AccountId], [SpecialtyId], [FullName], [Expertise]) VALUES (2, 1, N'Nguyễn Thị Bình', N'Chuyên nội khoa tổng quát')
INSERT [dbo].[Staff] ([AccountId], [SpecialtyId], [FullName], [Expertise]) VALUES (3, 4, N'Phạm Văn Cường', N'Chuyên gia Da liễu')
INSERT [dbo].[Staff] ([AccountId], [SpecialtyId], [FullName], [Expertise]) VALUES (4, NULL, N'Trần Thị Lễ Tân', N'Lễ tân')
INSERT [dbo].[Staff] ([AccountId], [SpecialtyId], [FullName], [Expertise]) VALUES (5, NULL, N'Lý Văn Xét Nghiệm', N'Kỹ thuật viên')
GO

INSERT [dbo].[Patient] ([AccountId], [FullName], [DateOfBirth], [Address]) VALUES (6, N'Trần Văn An', CAST(N'1990-05-15' AS Date), N'123 Đường ABC, TP.HCM')
INSERT [dbo].[Patient] ([AccountId], [FullName], [DateOfBirth], [Address]) VALUES (7, N'Nguyễn Thị Bích', CAST(N'1985-11-20' AS Date), N'456 Đường DEF, Hà Nội')
INSERT [dbo].[Patient] ([AccountId], [FullName], [DateOfBirth], [Address]) VALUES (8, N'Lê Minh Cường', CAST(N'2000-01-30' AS Date), N'789 Đường GHI, Đà Nẵng')
INSERT [dbo].[Patient] ([AccountId], [FullName], [DateOfBirth], [Address]) VALUES (9, N'Phạm Thu Duyên', CAST(N'1995-07-10' AS Date), N'101 Đường JKL, Cần Thơ')
INSERT [dbo].[Patient] ([AccountId], [FullName], [DateOfBirth], [Address]) VALUES (10, N'Võ Hùng Em', CAST(N'1978-03-25' AS Date), N'202 Đường MNO, Bình Dương')
INSERT [dbo].[Patient] ([AccountId], [FullName], [DateOfBirth], [Address]) VALUES (11, N'Nguyễn Văn A', CAST(N'2025-10-08' AS Date), N'An Phú Đông, Q12')
INSERT [dbo].[Patient] ([AccountId], [FullName], [DateOfBirth], [Address]) VALUES (12, N'Lê Văn C', CAST(N'2025-10-26' AS Date), N'An Phú Đông, Q12')
INSERT [dbo].[Patient] ([AccountId], [FullName], [DateOfBirth], [Address]) VALUES (13, N'Nguyễn Đại Thành', CAST(N'2015-10-12' AS Date), N'An Phú Đông, Q12')
GO

INSERT [dbo].[PatientMedicalRecord] ([PatientId], [StaffId], [Diagnosis], [TreatmentMethod], [RequiresTest], [CreateAt], [Status]) VALUES (7, 1, N'Nhức đầu vừa', N'Uống thuốc', 0, CAST(N'2025-10-30T12:13:36.267' AS DateTime), 1)
INSERT [dbo].[PatientMedicalRecord] ([PatientId], [StaffId], [Diagnosis], [TreatmentMethod], [RequiresTest], [CreateAt], [Status]) VALUES (6, 1, N'Đau tay phải', N'Bó bột', 1, CAST(N'2025-10-30T12:17:40.397' AS DateTime), 1)
GO

INSERT [dbo].[Appointment] ([PatientId], [StaffId], [MedicalServiceId], [PatientMedicalRecordId], [AppointmentDate], [AppointmentTime], [Status], [Revisit]) VALUES (1, NULL, 2, NULL, CAST(N'2025-10-24' AS Date), CAST(N'14:30:00' AS Time), 0, 0)
INSERT [dbo].[Appointment] ([PatientId], [StaffId], [MedicalServiceId], [PatientMedicalRecordId], [AppointmentDate], [AppointmentTime], [Status], [Revisit]) VALUES (2, 1, 4, NULL, CAST(N'2025-10-29' AS Date), CAST(N'13:30:00' AS Time), 1, 0)
INSERT [dbo].[Appointment] ([PatientId], [StaffId], [MedicalServiceId], [PatientMedicalRecordId], [AppointmentDate], [AppointmentTime], [Status], [Revisit]) VALUES (3, 1, 1, NULL, CAST(N'2025-10-24' AS Date), CAST(N'15:30:00' AS Time), 1, 0)
INSERT [dbo].[Appointment] ([PatientId], [StaffId], [MedicalServiceId], [PatientMedicalRecordId], [AppointmentDate], [AppointmentTime], [Status], [Revisit]) VALUES (4, NULL, 2, NULL, CAST(N'2025-10-29' AS Date), CAST(N'15:30:00' AS Time), 5, 0)
INSERT [dbo].[Appointment] ([PatientId], [StaffId], [MedicalServiceId], [PatientMedicalRecordId], [AppointmentDate], [AppointmentTime], [Status], [Revisit]) VALUES (5, 1, 2, 2, CAST(N'2025-10-18' AS Date), CAST(N'08:00:00' AS Time), 4, 0)
INSERT [dbo].[Appointment] ([PatientId], [StaffId], [MedicalServiceId], [PatientMedicalRecordId], [AppointmentDate], [AppointmentTime], [Status], [Revisit]) VALUES (6, 1, 1, 1, CAST(N'2025-10-27' AS Date), CAST(N'09:00:00' AS Time), 4, 0)
INSERT [dbo].[Appointment] ([PatientId], [StaffId], [MedicalServiceId], [PatientMedicalRecordId], [AppointmentDate], [AppointmentTime], [Status], [Revisit]) VALUES (7, 1, 2, 2, CAST(N'2025-10-06' AS Date), CAST(N'09:00:00' AS Time), 1, 1)
GO

INSERT [dbo].[Notification] ([AccountId], [Title], [Message], [Type], [CreatedAt], [IsRead]) VALUES (11, N'Lịch khám đã được xác nhận', N'Lịch khám của bạn với BS. Nguyễn Thị Bình đã được xác nhận.', N'appointment', CAST(N'2025-10-30T12:12:42.063' AS DateTime), 1)
INSERT [dbo].[Notification] ([AccountId], [Title], [Message], [Type], [CreatedAt], [IsRead]) VALUES (2, N'Lịch hẹn mới', N'Bạn có lịch hẹn với bệnh nhân Nguyễn Văn A đã được xác nhận.', N'appointment', CAST(N'2025-10-30T12:12:42.063' AS DateTime), 1)
INSERT [dbo].[Notification] ([AccountId], [Title], [Message], [Type], [CreatedAt], [IsRead]) VALUES (12, N'Lịch khám đã được xác nhận', N'Lịch khám của bạn với BS. Nguyễn Thị Bình đã được xác nhận.', N'appointment', CAST(N'2025-10-30T12:12:47.483' AS DateTime), 1)
INSERT [dbo].[Notification] ([AccountId], [Title], [Message], [Type], [CreatedAt], [IsRead]) VALUES (2, N'Lịch hẹn mới', N'Bạn có lịch hẹn với bệnh nhân Lê Văn C đã được xác nhận.', N'appointment', CAST(N'2025-10-30T12:12:47.483' AS DateTime), 1)
INSERT [dbo].[Notification] ([AccountId], [Title], [Message], [Type], [CreatedAt], [IsRead]) VALUES (2, N'Bệnh nhân đã đến', N'Bệnh nhân Lê Văn C đã đến phòng khám [Mã LH: 6].', N'appointment', CAST(N'2025-10-30T12:12:59.250' AS DateTime), 1)
INSERT [dbo].[Notification] ([AccountId], [Title], [Message], [Type], [CreatedAt], [IsRead]) VALUES (2, N'Bệnh nhân đã đến', N'Bệnh nhân Nguyễn Văn A đã đến phòng khám [Mã LH: 5].', N'appointment', CAST(N'2025-10-30T12:13:02.633' AS DateTime), 1)
GO

INSERT [dbo].[Medicine] ([Name], [Category], [Description], [Unit], [Contraindications], [Interactions], [Price]) VALUES (N'Paracetamol 500mg', N'Giảm đau, Hạ sốt', N'Giảm đau thông thường, hạ sốt', N'Viên', N'Người mẫn cảm với Paracetamol, bệnh gan nặng', N'Rượu, thuốc chống đông máu', CAST(1500.00 AS Decimal(18, 2)))
INSERT [dbo].[Medicine] ([Name], [Category], [Description], [Unit], [Contraindications], [Interactions], [Price]) VALUES (N'Amoxicillin 500mg', N'Kháng sinh', N'Kháng sinh nhóm Penicillin', N'Viên', N'Dị ứng Penicillin', N'Thuốc Gout (Allopurinol)', CAST(2500.00 AS Decimal(18, 2)))
INSERT [dbo].[Medicine] ([Name], [Category], [Description], [Unit], [Contraindications], [Interactions], [Price]) VALUES (N'Omeprazole 20mg', N'Dạ dày', N'Ức chế bơm proton, giảm tiết acid', N'Viên', N'Người mẫn cảm với Omeprazole', N'Diazepam, Warfarin', CAST(3000.00 AS Decimal(18, 2)))
INSERT [dbo].[Medicine] ([Name], [Category], [Description], [Unit], [Contraindications], [Interactions], [Price]) VALUES (N'Loratadine 10mg', N'Dị ứng', N'Kháng Histamin H1', N'Viên', N'Quá mẫn với thành phần', N'Cimetidin, Ketoconazol', CAST(2000.00 AS Decimal(18, 2)))
GO

INSERT [dbo].[Invoice] ([PatientMedicalRecordId], [PaymentDate], [TotalAmount], [Status]) VALUES (1, CAST(N'2025-10-30T12:18:18.897' AS DateTime), CAST(200000 AS Decimal(15, 0)), 1)
INSERT [dbo].[Invoice] ([PatientMedicalRecordId], [PaymentDate], [TotalAmount], [Status]) VALUES (2, CAST(N'2025-10-30T12:18:24.680' AS DateTime), CAST(250000 AS Decimal(15, 0)), 1)
GO