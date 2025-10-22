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

CREATE TABLE Appointment (
	Id					INT		IDENTITY(1,1),
	PatientId			INT		NOT NULL,
	StaffId				INT		NULL, ---- Vừa đặt lịch chưa cần bác sĩ
	MedicalServiceId	INT		NOT NULL,
	AppointmentDate		Date	NOT NULL,
	AppointmentTime		Time	NOT NULL,
	Status				INT		NOT NULL
	CONSTRAINT PK_Appointment PRIMARY KEY (Id)
);
GO

CREATE TABLE Invoice (
	Id							INT				IDENTITY(1,1),
	PatientMedicalRecordId		INT				NOT NULL	UNIQUE, ---- 1-1
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
	AppointmentId		INT				NOT NULL	UNIQUE, ---- 1-1
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
ON DELETE CASCADE;
GO

ALTER TABLE Account
ADD CONSTRAINT FK_Account_Role FOREIGN KEY (RoleId) REFERENCES Role(Id);
GO

ALTER TABLE Appointment
ADD CONSTRAINT FK_Appointment_Patient FOREIGN KEY (PatientId) REFERENCES Patient(Id)
ON DELETE CASCADE;
GO

ALTER TABLE Appointment
ADD CONSTRAINT FK_Appointment_Staff FOREIGN KEY (StaffId) REFERENCES Staff(Id);
GO

ALTER TABLE Appointment
ADD CONSTRAINT FK_Appointment_MedicalService FOREIGN KEY (MedicalServiceId) REFERENCES MedicalService(Id);
GO

ALTER TABLE Invoice
ADD CONSTRAINT FK_Invoice_PatientMedicalRecord FOREIGN KEY (PatientMedicalRecordId) REFERENCES PatientMedicalRecord(Id)
GO

ALTER TABLE Symptom
ADD CONSTRAINT FK_Symptom_PatientMedicalRecord FOREIGN KEY (PatientMedicalRecordId) REFERENCES PatientMedicalRecord(Id)
ON DELETE CASCADE;
GO

ALTER TABLE TestResult
ADD CONSTRAINT FK_TestResult_PatientMedicalRecord FOREIGN KEY (PatientMedicalRecordId) REFERENCES PatientMedicalRecord(Id)
ON DELETE CASCADE;
GO

ALTER TABLE TestResult
ADD CONSTRAINT FK_TestResult_Staff FOREIGN KEY (StaffId) REFERENCES Staff(Id);
GO

ALTER TABLE PatientMedicalRecord
ADD CONSTRAINT FK_PatientMedicalRecord_Patient FOREIGN KEY (PatientId) REFERENCES Patient(Id)
ON DELETE CASCADE;
GO

ALTER TABLE PatientMedicalRecord
ADD CONSTRAINT FK_PatientMedicalRecord_Appointment FOREIGN KEY (AppointmentId) REFERENCES Appointment(Id)
GO

ALTER TABLE PatientMedicalRecord
ADD CONSTRAINT FK_PatientMedicalRecord_Staff FOREIGN KEY (StaffId) REFERENCES Staff(Id);
GO

ALTER TABLE Prescription
ADD CONSTRAINT FK_Prescription_PatientMedicalRecord FOREIGN KEY (PatientMedicalRecordId) REFERENCES PatientMedicalRecord(Id)
ON DELETE CASCADE;
GO

ALTER TABLE PrescriptionDetail
ADD CONSTRAINT FK_PrescriptionDetail_Prescription FOREIGN KEY (PrescriptionId) REFERENCES Prescription(Id)
ON DELETE CASCADE;
GO

ALTER TABLE PrescriptionDetail
ADD CONSTRAINT FK_PrescriptionDetail_Medicine FOREIGN KEY (MedicineId) REFERENCES Medicine(Id)
ON DELETE CASCADE;
GO

-- 4. Insert Data
INSERT INTO [Role] (Name) 
VALUES 
    (N'Admin'),           -- Quản trị viên hệ thống
    (N'Patient'),         -- Bệnh nhân
    (N'Doctor'),          -- Bác sĩ
    (N'Receptionist'),    -- Lễ tân
    (N'LabTechnician');   -- Kỹ thuật viên xét nghiệm
GO

---- Pass: thanh1111
INSERT INTO Account (RoleId, Username, Password, PhoneNumber, Email)
VALUES 
    -- Staff
    (1, N'Admin', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0123456789', N'admin@clinic.com');  -- Admin
GO

INSERT INTO Specialty (Name)
VALUES 
    (N'Nội khoa'),           -- Chuyên khoa Nội
    (N'Ngoại khoa'),         -- Chuyên khoa Ngoại
    (N'Nhi khoa'),           -- Chuyên khoa Nhi
    (N'Da liễu');            -- Chuyên khoa Da liễu
GO

INSERT INTO MedicalService (SpecialtyId, Name, Cost)
VALUES 
    (1, N'Khám nội khoa tổng quát', 200000),   -- Dịch vụ khám tổng quát, chuyên khoa Nội
    (1, N'Khám tim mạch', 300000),             -- Dịch vụ khám tim mạch, chuyên khoa Nội
    (2, N'Khám ngoại khoa', 250000),           -- Dịch vụ khám ngoại khoa, chuyên khoa Ngoại
    (3, N'Khám nhi khoa', 150000),             -- Dịch vụ khám nhi, chuyên khoa Nhi
    (4, N'Khám da liễu', 200000),              -- Dịch vụ khám da liễu, chuyên khoa Da liễu
    (1, N'Xét nghiệm máu cơ bản', 500000),     -- Dịch vụ xét nghiệm máu, chuyên khoa Nội
    (2, N'Tiểu phẫu', 1000000);                -- Dịch vụ tiểu phẫu, chuyên khoa Ngoại
GO

INSERT INTO Medicine (Name, Category, Description, Unit, Contraindications, Interactions, Price)
VALUES 
-- Thuốc nội khoa
    (N'Atenolol', N'Hạ huyết áp', N'Beta-blocker cho tăng huyết áp', N'Tiêm', N'Block tim', N'Tương tác với cimetidine', 27401),
    (N'Amlodipine', N'Hạ huyết áp', N'Dẫn xuất dihydropyridine', N'Dung dịch hít', N'Bệnh gan hoạt động', N'Không kết hợp rượu', 44690),
    (N'Lisinopril', N'Hạ huyết áp', N'Ức chế men chuyển angiotensin', N'Gói bột', N'Suy tim nặng', N'Tương tác với propranolol', 40256),
    (N'Hydrochlorothiazide', N'Hạ huyết áp', N'Thiazide diuretic', N'Viên', N'Dị ứng Hydrochlorothiazide', N'Tương tác với warfarin', 3344),
    (N'Losartan', N'Hạ huyết áp', N'Chẹn thụ thể angiotensin II', N'Siro', N'Dị ứng Losartan', N'Không kết hợp rượu', 35886),
    (N'Methyldopa', N'Hạ huyết áp', N'Cho tăng huyết áp do thai kỳ', N'Gói bột', N'Suy tim nặng', N'Không kết hợp rượu', 47707),
    (N'Telmisartan', N'Hạ huyết áp', N'Chẹn thụ thể angiotensin II', N'Viên', N'Loét dạ dày', N'Tương tác với warfarin', 39636),
    (N'Perindopril', N'Hạ huyết áp', N'Ức chế men chuyển', N'Siro', N'Suy tim nặng', N'Tương tác với warfarin', 29988),
    (N'Ramipril', N'Hạ huyết áp', N'Ức chế men chuyển', N'Siro', N'Loét dạ dày', N'Tương tác với clopidogrel', 8454),
    (N'Simvastatin', N'Giảm cholesterol', N'Statin cho mỡ máu cao', N'Ống tiêm', N'Bệnh gan hoạt động', N'Tương tác với propranolol', 45402),
    (N'Atorvastatin', N'Giảm cholesterol', N'Statin', N'Tiêm', N'Block tim', N'Tương tác với clopidogrel', 39898),
    (N'Bisoprolol', N'Chống loạn nhịp', N'Beta-blocker', N'Ống tiêm', N'Loét dạ dày', N'Tương tác với warfarin', 45556),
    (N'Carvedilol', N'Chống loạn nhịp', N'Beta-blocker', N'Dung dịch hít', N'Suy tim nặng', N'Tương tác với aspirin', 38663),
    (N'Metoprolol', N'Chống loạn nhịp', N'Beta-blocker', N'Dung dịch hít', N'Dị ứng Metoprolol', N'Không tương tác đáng kể', 36048),
    (N'Hydralazine', N'Hạ huyết áp', N'Cho tăng huyết áp nặng', N'Kem bôi', N'Suy thận nặng', N'Không kết hợp rượu', 18103),
    (N'Apixaban', N'Chống huyết khối', N'Kháng đông', N'Kem bôi', N'Dị ứng Apixaban', N'Tương tác với clopidogrel', 11589),
    (N'Dalteparin', N'Chống huyết khối', N'Heparin', N'Dung dịch hít', N'Dị ứng penicillin', N'Tương tác với propranolol', 30618),
    (N'Furosemide', N'Lợi tiểu', N'Cho suy tim', N'Kem bôi', N'Dị ứng Furosemide', N'Tương tác với lithium', 29195),
    (N'Spironolactone', N'Lợi tiểu', N'Thuốc bổ sung cho suy tim', N'Gói bột', N'Suy tim nặng', N'Không kết hợp rượu', 17480),
    (N'Digoxin', N'Suy tim', N'Điều trị suy tim', N'Ống tiêm', N'Loét dạ dày', N'Tương tác với aspirin', 8161),
    (N'Enalapril', N'Hạ huyết áp', N'Cho tăng huyết áp và suy tim', N'Viên', N'Loét dạ dày', N'Tương tác với lithium', 34755),
    (N'Warfarin', N'Chống huyết khối', N'Phòng ngừa huyết khối', N'Dung dịch hít', N'Suy thận nặng', N'Tương tác với propranolol', 12652),
    (N'Omeprazole', N'Giảm acid dạ dày', N'Ức chế bơm proton', N'Viên', N'Dị ứng Omeprazole', N'Tương tác với lithium', 29017),
    (N'Ranitidine', N'Giảm acid dạ dày', N'Đối kháng H2', N'Tiêm', N'Dị ứng penicillin', N'Không tương tác đáng kể', 45886),
    (N'Sulfasalazine', N'Chống viêm', N'Cho viêm ruột', N'Viên', N'Suy thận nặng', N'Tương tác với clopidogrel', 17441),
    (N'Mesalazine', N'Chống viêm', N'Cho viêm ruột', N'Kem bôi', N'Dị ứng penicillin', N'Tương tác với propranolol', 16810),
    (N'Bisacodyl', N'Trị táo bón', N'Thuốc nhuận tràng', N'Gói bột', N'Bệnh gan hoạt động', N'Tương tác với lithium', 5891),
    (N'Metoclopramide', N'Chống nôn', N'Chống nôn', N'Viên', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với clopidogrel', 19453),
    (N'Ondansetron', N'Chống nôn', N'Chống nôn', N'Gói bột', N'Block tim', N'Không kết hợp rượu', 24405),
    (N'Loperamide', N'Trị tiêu chảy', N'Cho tiêu chảy cấp', N'Gói bột', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với warfarin', 16703),
    (N'Zinc sulfate', N'Trị tiêu chảy', N'Bổ trợ cho tiêu chảy', N'Tiêm', N'Block tim', N'Tương tác với cimetidine', 9839),
    (N'Oral rehydration salts', N'Bù nước', N'Cho tiêu chảy', N'Kem bôi', N'Block tim', N'Tương tác với propranolol', 23408),
    (N'Insulin injection', N'Đái tháo đường', N'Hạ đường huyết', N'Tiêm', N'Suy thận nặng', N'Không tương tác đáng kể', 32670),
    (N'Insulin human', N'Đái tháo đường', N'Hạ đường huyết', N'Gói bột', N'Suy thận nặng', N'Tương tác với cimetidine', 45996),
    (N'Metformin', N'Đái tháo đường', N'Cho type 2', N'Kem bôi', N'Suy tim nặng', N'Không tương tác đáng kể', 29591),
    (N'Glibenclamide', N'Đái tháo đường', N'Sulfonylurea', N'Siro', N'Loét dạ dày', N'Tương tác với clopidogrel', 31878),
    (N'Gliclazide', N'Đái tháo đường', N'Sulfonylurea', N'Siro', N'Dị ứng penicillin', N'Tương tác với propranolol', 39306),
    (N'Empagliflozin', N'Đái tháo đường', N'SGLT2 inhibitor', N'Dung dịch hít', N'Suy tim nặng', N'Tương tác với cimetidine', 8986),
    (N'Levothyroxine', N'Suy giáp', N'Thay thế hormone', N'Gói bột', N'Block tim', N'Không kết hợp rượu', 33950),
    (N'Methimazole', N'Cường giáp', N'Kháng giáp', N'Dung dịch hít', N'Bệnh gan hoạt động', N'Tương tác với warfarin', 8635),
    (N'Propylthiouracil', N'Cường giáp', N'Kháng giáp', N'Siro', N'Dị ứng Propylthiouracil', N'Không tương tác đáng kể', 32412),
    (N'Bromocriptine', N'Rối loạn hormone', N'Cho tuyến yên', N'Tiêm', N'Bệnh gan hoạt động', N'Không tương tác đáng kể', 28634),
    (N'Prednisone', N'Corticosteroid', N'Chống viêm', N'Tiêm', N'Block tim', N'Tương tác với clopidogrel', 6748),
    (N'Salbutamol', N'Hô hấp', N'Giãn phế quản', N'Gói bột', N'Block tim', N'Tương tác với clopidogrel', 34424),
    (N'Beclometasone', N'Hô hấp', N'Corticosteroid hít', N'Tiêm', N'Suy thận nặng', N'Tương tác với cimetidine', 12491),
    (N'Budesonide', N'Hô hấp', N'Cho hen suyễn', N'Kem bôi', N'Bệnh gan hoạt động', N'Tương tác với lithium', 30044),
    (N'Ipratropium bromide', N'Hô hấp', N'Kháng cholinergic', N'Kem bôi', N'Suy thận nặng', N'Tương tác với lithium', 48883),
    (N'Terbutaline', N'Hô hấp', N'Giãn phế quản', N'Kem bôi', N'Dị ứng Terbutaline', N'Tương tác với propranolol', 15205),
    (N'Aspirin', N'Giảm đau', N'NSAID', N'Siro', N'Block tim', N'Tương tác với aspirin', 36817),
    (N'Paracetamol', N'Giảm đau', N'Hạ sốt', N'Gói bột', N'Bệnh gan hoạt động', N'Tương tác với cimetidine', 42950),
    (N'Ibuprofen', N'Giảm đau', N'NSAID', N'Viên', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với warfarin', 10956),
    (N'Codeine', N'Giảm đau', N'Opioid', N'Gói bột', N'Block tim', N'Tương tác với warfarin', 12363),
    (N'Morphine', N'Giảm đau', N'Cho đau ung thư', N'Dung dịch hít', N'Loét dạ dày', N'Không tương tác đáng kể', 46118),

    -- Thuốc ngoại khoa
    (N'Ibuprofen', N'Giảm đau chống viêm', N'Giảm đau khớp, sưng', N'Kem bôi', N'Block tim', N'Tương tác với clopidogrel', 39548),
    (N'Amoxicillin', N'Kháng sinh', N'Kháng khuẩn phổ rộng', N'Dung dịch hít', N'Dị ứng penicillin', N'Tương tác với propranolol', 33639),
    (N'Diclofenac', N'Giảm đau chống viêm', N'Giảm đau sau phẫu thuật', N'Ống tiêm', N'Dị ứng Diclofenac', N'Không tương tác đáng kể', 25217),
    (N'Cefazolin', N'Kháng sinh', N'Phòng ngừa nhiễm trùng phẫu thuật', N'Gói bột', N'Dị ứng penicillin', N'Tương tác với propranolol', 20380),
    (N'Lidocaine', N'Thuốc tê', N'Gây tê tại chỗ', N'Ống tiêm', N'Loét dạ dày', N'Tương tác với propranolol', 43713),
    (N'Ceftriaxone', N'Kháng sinh', N'Cho nhiễm trùng', N'Gói bột', N'Dị ứng Ceftriaxone', N'Tương tác với cimetidine', 21446),
    (N'Metronidazole', N'Kháng sinh', N'Cho kỵ khí', N'Viên', N'Suy thận nặng', N'Tương tác với clopidogrel', 37184),
    (N'Vancomycin', N'Kháng sinh', N'Cho MRSA', N'Viên', N'Loét dạ dày', N'Không kết hợp rượu', 45919),
    (N'Gentamicin', N'Kháng sinh', N'Aminoglycoside', N'Tiêm', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với clopidogrel', 31027),
    (N'Clindamycin', N'Kháng sinh', N'Cho nhiễm trùng da', N'Gói bột', N'Loét dạ dày', N'Không kết hợp rượu', 11430),
    (N'Morphine', N'Giảm đau', N'Cho đau sau mổ', N'Viên', N'Bệnh gan hoạt động', N'Tương tác với cimetidine', 8260),
    (N'Fentanyl', N'Giảm đau', N'Opioid mạnh', N'Kem bôi', N'Suy thận nặng', N'Không tương tác đáng kể', 26210),
    (N'Ketorolac', N'Giảm đau', N'NSAID tiêm', N'Kem bôi', N'Suy tim nặng', N'Không kết hợp rượu', 8221),
    (N'Propofol', N'Gây mê', N'Gây mê toàn thân', N'Siro', N'Dị ứng Propofol', N'Tương tác với cimetidine', 28508),
    (N'Midazolam', N'An thần', N'Cho tiền mê', N'Kem bôi', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với warfarin', 13084),
    (N'Suxamethonium', N'Giãn cơ', N'Cho đặt nội khí quản', N'Dung dịch hít', N'Dị ứng Suxamethonium', N'Tương tác với cimetidine', 14076),
    (N'Rocuronium', N'Giãn cơ', N'Giãn cơ không khử cực', N'Siro', N'Bệnh gan hoạt động', N'Không tương tác đáng kể', 30764),
    (N'Neostigmine', N'Đảo ngược giãn cơ', N'Đảo ngược rocuronium', N'Siro', N'Suy tim nặng', N'Tương tác với clopidogrel', 10412),
    (N'Heparin', N'Chống đông', N'Phòng huyết khối', N'Viên', N'Suy tim nặng', N'Không tương tác đáng kể', 4693),
    (N'Enoxaparin', N'Chống đông', N'LMWH cho phẫu thuật', N'Viên', N'Block tim', N'Tương tác với lithium', 13127),
    (N'Tranexamic acid', N'Chống tiêu sợi huyết', N'Giảm mất máu', N'Siro', N'Dị ứng penicillin', N'Tương tác với warfarin', 39815),
    (N'Erythropoietin', N'Kích thích tạo hồng cầu', N'Cho thiếu máu trước mổ', N'Tiêm', N'Dị ứng Erythropoietin', N'Không kết hợp rượu', 36390),
    (N'Vitamin K', N'Chống đông', N'Đảo ngược warfarin', N'Gói bột', N'Suy tim nặng', N'Tương tác với aspirin', 36055),
    (N'Protamine', N'Đảo ngược heparin', N'Đảo ngược heparin', N'Kem bôi', N'Suy tim nặng', N'Tương tác với propranolol', 32222),
    (N'Octreotide', N'Chống tiết hormone', N'Cho xuất huyết tiêu hóa', N'Ống tiêm', N'Block tim', N'Không tương tác đáng kể', 37846),
    (N'Somatostatin', N'Chống tiết hormone', N'Cho xuất huyết', N'Viên', N'Suy tim nặng', N'Tương tác với propranolol', 13048),
    (N'Omeprazole', N'Giảm acid', N'Phòng loét stress', N'Viên', N'Suy tim nặng', N'Không kết hợp rượu', 5394),
    (N'Pantoprazole', N'Giảm acid', N'IV cho bệnh nhân mổ', N'Siro', N'Dị ứng penicillin', N'Tương tác với lithium', 7919),
    (N'Dexamethasone', N'Corticosteroid', N'Chống nôn sau mổ', N'Gói bột', N'Block tim', N'Không tương tác đáng kể', 44576),
    (N'Ondansetron', N'Chống nôn', N'Sau phẫu thuật', N'Kem bôi', N'Loét dạ dày', N'Tương tác với cimetidine', 46607),
    (N'Metoclopramide', N'Chống nôn', N'Tăng nhu động ruột', N'Kem bôi', N'Dị ứng Metoclopramide', N'Không tương tác đáng kể', 25892),
    (N'Lactulose', N'Nhũ hóa', N'Trị táo bón sau mổ', N'Tiêm', N'Không dùng cho trẻ em dưới 1 tuổi', N'Không tương tác đáng kể', 29063),
    (N'Bisacodyl', N'Nhuận tràng', N'Sau mổ', N'Gói bột', N'Dị ứng penicillin', N'Tương tác với warfarin', 42910),
    (N'Paracetamol', N'Giảm đau', N'Hạ sốt sau mổ', N'Tiêm', N'Loét dạ dày', N'Không kết hợp rượu', 22620),
    (N'Tramadol', N'Giảm đau', N'Opioid nhẹ', N'Ống tiêm', N'Loét dạ dày', N'Không tương tác đáng kể', 4448),
    (N'Bupivacaine', N'Thuốc tê', N'Gây tê tủy sống', N'Kem bôi', N'Dị ứng penicillin', N'Tương tác với clopidogrel', 17377),
    (N'Ropivacaine', N'Thuốc tê', N'Gây tê vùng', N'Viên', N'Suy tim nặng', N'Tương tác với warfarin', 48630),
    (N'Epinephrine', N'Co mạch', N'Kết hợp với tê', N'Ống tiêm', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với clopidogrel', 5864),
    (N'Atropine', N'Chống cholinergic', N'Cho bradycardia trong mổ', N'Gói bột', N'Block tim', N'Tương tác với lithium', 11311),
    (N'Glycopyrrolate', N'Chống tiết', N'Giảm tiết nước bọt', N'Tiêm', N'Dị ứng penicillin', N'Tương tác với propranolol', 4111),
    (N'Cefuroxime', N'Kháng sinh', N'Phòng nhiễm trùng', N'Dung dịch hít', N'Loét dạ dày', N'Không tương tác đáng kể', 24380),
    (N'Azithromycin', N'Kháng sinh', N'Cho hô hấp', N'Siro', N'Suy tim nặng', N'Không kết hợp rượu', 12860),
    (N'Fluconazole', N'Chống nấm', N'Phòng nấm sau mổ', N'Siro', N'Suy thận nặng', N'Không tương tác đáng kể', 18927),
    (N'Albendazole', N'Trị giun', N'Nếu cần', N'Kem bôi', N'Không dùng cho trẻ em dưới 1 tuổi', N'Không tương tác đáng kể', 40756),
    (N'Povidone iodine', N'Sát khuẩn', N'Bôi ngoài', N'Viên', N'Suy tim nặng', N'Tương tác với aspirin', 24338),
    (N'Chlorhexidine', N'Sát khuẩn', N'Rửa da trước mổ', N'Gói bột', N'Dị ứng penicillin', N'Không tương tác đáng kể', 25981),
    (N'Silver sulfadiazine', N'Chống nhiễm trùng', N'Cho bỏng', N'Gói bột', N'Suy tim nặng', N'Không tương tác đáng kể', 10285),
    (N'Mupirocin', N'Kháng sinh bôi', N'Cho vết thương', N'Ống tiêm', N'Dị ứng Mupirocin', N'Tương tác với clopidogrel', 41184),

    -- Thuốc nhi khoa
    (N'Paracetamol', N'Giảm đau hạ sốt', N'Cho trẻ em', N'Gói bột', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với aspirin', 27616),
    (N'Ibuprofen', N'Giảm đau chống viêm', N'Cho trẻ', N'Kem bôi', N'Suy tim nặng', N'Không kết hợp rượu', 24472),
    (N'Amoxicillin', N'Kháng sinh', N'Phổ rộng cho trẻ', N'Viên', N'Bệnh gan hoạt động', N'Tương tác với clopidogrel', 38223),
    (N'Cefuroxime', N'Kháng sinh', N'Cho nhiễm trùng trẻ', N'Kem bôi', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với aspirin', 44878),
    (N'Azithromycin', N'Kháng sinh', N'Macrolide cho trẻ', N'Kem bôi', N'Block tim', N'Tương tác với lithium', 3280),
    (N'Salbutamol', N'Giãn phế quản', N'Cho hen trẻ', N'Gói bột', N'Suy thận nặng', N'Tương tác với clopidogrel', 4535),
    (N'Budesonide', N'Corticosteroid hít', N'Cho hen', N'Tiêm', N'Loét dạ dày', N'Tương tác với lithium', 27417),
    (N'Montelukast', N'Chống hen', N'Lênkít', N'Tiêm', N'Loét dạ dày', N'Tương tác với propranolol', 38440),
    (N'Oresol', N'Bù nước', N'Cho tiêu chảy trẻ', N'Siro', N'Suy tim nặng', N'Tương tác với lithium', 12433),
    (N'Zinc', N'Bổ sung', N'Cho tiêu chảy', N'Kem bôi', N'Bệnh gan hoạt động', N'Không kết hợp rượu', 11114),
    (N'Desloratadine', N'Kháng histamin', N'Cho dị ứng trẻ', N'Ống tiêm', N'Bệnh gan hoạt động', N'Tương tác với propranolol', 36682),
    (N'Cetirizine', N'Kháng histamin', N'Cho trẻ', N'Viên', N'Suy thận nặng', N'Tương tác với lithium', 47385),
    (N'Prednisolone', N'Corticosteroid', N'Cho viêm', N'Kem bôi', N'Bệnh gan hoạt động', N'Tương tác với propranolol', 30151),
    (N'Hydrocortisone', N'Corticosteroid', N'Bôi cho trẻ', N'Gói bột', N'Bệnh gan hoạt động', N'Tương tác với warfarin', 10408),
    (N'Metformin', N'Đái tháo đường', N'Cho trẻ lớn', N'Tiêm', N'Bệnh gan hoạt động', N'Tương tác với clopidogrel', 15277),
    (N'Insulin', N'Đái tháo đường', N'Cho trẻ', N'Tiêm', N'Suy tim nặng', N'Tương tác với lithium', 47821),
    (N'Levothyroxine', N'Suy giáp', N'Cho trẻ', N'Ống tiêm', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với warfarin', 28704),
    (N'Ferrous sulfate', N'Bổ sung sắt', N'Thiếu máu trẻ', N'Siro', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với warfarin', 3077),
    (N'Folic acid', N'Bổ sung', N'Cho thiếu máu', N'Siro', N'Loét dạ dày', N'Tương tác với cimetidine', 44993),
    (N'Vitamin D', N'Bổ sung', N'Cho còi xương', N'Siro', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với clopidogrel', 6290),
    (N'Multivitamin', N'Bổ sung', N'Tăng đề kháng', N'Gói bột', N'Suy tim nặng', N'Tương tác với clopidogrel', 44225),
    (N'Oseltamivir', N'Chống virus', N'Cho cúm trẻ', N'Gói bột', N'Dị ứng Oseltamivir', N'Tương tác với aspirin', 15986),
    (N'Acetylcysteine', N'Long đờm', N'Cho hô hấp', N'Viên', N'Dị ứng Acetylcysteine', N'Không tương tác đáng kể', 43536),
    (N'Bromhexine', N'Long đờm', N'Cho ho', N'Dung dịch hít', N'Dị ứng penicillin', N'Không kết hợp rượu', 10544),
    (N'Dextromethorphan', N'Chống ho', N'Cho ho khan', N'Viên', N'Loét dạ dày', N'Không kết hợp rượu', 9774),
    (N'Codeine', N'Chống ho', N'Cẩn thận cho trẻ', N'Kem bôi', N'Loét dạ dày', N'Tương tác với propranolol', 34666),
    (N'Diphenhydramine', N'Kháng histamin', N'Cho dị ứng', N'Gói bột', N'Loét dạ dày', N'Không tương tác đáng kể', 24307),
    (N'Loratadine', N'Kháng histamin', N'Cho trẻ', N'Siro', N'Suy thận nặng', N'Tương tác với clopidogrel', 11483),
    (N'Omeprazole', N'Giảm acid', N'Cho trào ngược trẻ', N'Ống tiêm', N'Bệnh gan hoạt động', N'Không tương tác đáng kể', 31831),
    (N'Ranitidine', N'Giảm acid', N'Cho trẻ', N'Viên', N'Loét dạ dày', N'Tương tác với propranolol', 35931),
    (N'Loperamide', N'Trị tiêu chảy', N'Cẩn thận cho trẻ', N'Viên', N'Suy thận nặng', N'Tương tác với propranolol', 23398),
    (N'Racecadotril', N'Trị tiêu chảy', N'Cho trẻ', N'Gói bột', N'Loét dạ dày', N'Tương tác với cimetidine', 9457),
    (N'Probiotics', N'Bổ sung vi sinh', N'Cho tiêu hóa', N'Kem bôi', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với warfarin', 15449),
    (N'Carbamazepine', N'Chống động kinh', N'Cho trẻ', N'Viên', N'Dị ứng penicillin', N'Tương tác với aspirin', 13543),
    (N'Valproate', N'Chống động kinh', N'Cho trẻ', N'Dung dịch hít', N'Block tim', N'Không tương tác đáng kể', 3168),
    (N'Phenytoin', N'Chống động kinh', N'Cho trẻ', N'Siro', N'Bệnh gan hoạt động', N'Tương tác với aspirin', 45337),
    (N'Levetiracetam', N'Chống động kinh', N'Cho trẻ', N'Gói bột', N'Dị ứng penicillin', N'Tương tác với warfarin', 17582),
    (N'Phenobarbital', N'Chống động kinh', N'Cho trẻ', N'Siro', N'Bệnh gan hoạt động', N'Tương tác với cimetidine', 20061),
    (N'Diazepam', N'Chống co giật', N'Cho trẻ', N'Tiêm', N'Block tim', N'Tương tác với warfarin', 17797),
    (N'Midazolam', N'An thần', N'Cho trẻ', N'Tiêm', N'Loét dạ dày', N'Không tương tác đáng kể', 18596),
    (N'Haloperidol', N'Chống loạn thần', N'Hiếm cho trẻ', N'Kem bôi', N'Loét dạ dày', N'Tương tác với lithium', 7180),
    (N'Risperidone', N'Chống loạn thần', N'Cho tự kỷ trẻ', N'Gói bột', N'Dị ứng Risperidone', N'Tương tác với warfarin', 46697),
    (N'Fluoxetine', N'Trầm cảm', N'Cho trẻ lớn', N'Ống tiêm', N'Dị ứng penicillin', N'Không tương tác đáng kể', 48856),
    (N'Sertraline', N'Trầm cảm', N'Cho trẻ', N'Kem bôi', N'Không dùng cho trẻ em dưới 1 tuổi', N'Không tương tác đáng kể', 27144),
    (N'Amitriptyline', N'Đau thần kinh', N'Cho trẻ', N'Ống tiêm', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với warfarin', 42769),
    (N'Gabapentin', N'Đau thần kinh', N'Cho trẻ', N'Dung dịch hít', N'Dị ứng Gabapentin', N'Tương tác với clopidogrel', 24280),
    (N'Topiramate', N'Động kinh và migraine', N'Cho trẻ', N'Ống tiêm', N'Loét dạ dày', N'Không tương tác đáng kể', 7639),
    (N'Sumatriptan', N'Migraine', N'Cho trẻ lớn', N'Kem bôi', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với clopidogrel', 3668),
    (N'Ibuprofen', N'Migraine', N'Cho trẻ', N'Kem bôi', N'Block tim', N'Tương tác với clopidogrel', 8465),

    -- Thuốc da liễu
    (N'Acitretin', N'Trị vảy nến', N'Retinoid cho da', N'Viên', N'Suy thận nặng', N'Không kết hợp rượu', 28078),
    (N'Dapson', N'Kháng viêm', N'Cho bệnh da', N'Siro', N'Dị ứng Dapson', N'Tương tác với warfarin', 11326),
    (N'Isotretinoin', N'Trị mụn', N'Retinoid cho mụn nặng', N'Ống tiêm', N'Bệnh gan hoạt động', N'Tương tác với warfarin', 38911),
    (N'Cystein', N'Bổ sung', N'Cho tóc da', N'Ống tiêm', N'Loét dạ dày', N'Tương tác với propranolol', 25982),
    (N'Acid Salicylic', N'Bong tróc', N'Cho sùi mào gà', N'Ống tiêm', N'Bệnh gan hoạt động', N'Tương tác với cimetidine', 20013),
    (N'Acyclovir', N'Chống virus', N'Cho herpes da', N'Siro', N'Dị ứng Acyclovir', N'Tương tác với clopidogrel', 13721),
    (N'Adapalene', N'Trị mụn', N'Retinoid bôi', N'Siro', N'Dị ứng penicillin', N'Tương tác với warfarin', 15517),
    (N'Betametason', N'Corticosteroid', N'Giảm viêm da', N'Kem bôi', N'Bệnh gan hoạt động', N'Tương tác với cimetidine', 19118),
    (N'Calcipotriol', N'Trị vảy nến', N'Vitamin D analog', N'Gói bột', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với warfarin', 36548),
    (N'Ciclopiroxolamin', N'Chống nấm', N'Cho nấm da', N'Siro', N'Dị ứng penicillin', N'Tương tác với aspirin', 43215),
    (N'Clindamycin', N'Kháng sinh', N'Cho mụn', N'Ống tiêm', N'Loét dạ dày', N'Không tương tác đáng kể', 42921),
    (N'Clobetasol Propionat', N'Corticosteroid', N'Mạnh cho viêm da', N'Dung dịch hít', N'Suy thận nặng', N'Không tương tác đáng kể', 3992),
    (N'Clotrimazol', N'Chống nấm', N'Cho nấm da', N'Kem bôi', N'Block tim', N'Không tương tác đáng kể', 14244),
    (N'Crotamiton', N'Chống ngứa', N'Cho ghẻ', N'Siro', N'Suy thận nặng', N'Không tương tác đáng kể', 8775),
    (N'Desonide', N'Corticosteroid', N'Nhẹ cho da', N'Siro', N'Bệnh gan hoạt động', N'Tương tác với propranolol', 30255),
    (N'Erythromycin', N'Kháng sinh', N'Cho mụn', N'Siro', N'Suy thận nặng', N'Tương tác với aspirin', 5758),
    (N'Flumethasone', N'Corticosteroid', N'Cho da', N'Gói bột', N'Dị ứng penicillin', N'Tương tác với aspirin', 26414),
    (N'Fluocinolon', N'Corticosteroid', N'Cho viêm', N'Tiêm', N'Bệnh gan hoạt động', N'Tương tác với warfarin', 40444),
    (N'Fusidic acid', N'Kháng sinh', N'Cho nhiễm trùng da', N'Viên', N'Block tim', N'Tương tác với propranolol', 18757),
    (N'Hydrocortison', N'Corticosteroid', N'Giảm viêm ngứa', N'Gói bột', N'Dị ứng Hydrocortison', N'Tương tác với clopidogrel', 26370),
    (N'Imiquimod', N'Kích thích miễn dịch', N'Cho sùi mào gà', N'Kem bôi', N'Dị ứng Imiquimod', N'Tương tác với aspirin', 17468),
    (N'Ketoconazol', N'Chống nấm', N'Cho nấm da', N'Gói bột', N'Dị ứng penicillin', N'Tương tác với aspirin', 34809),
    (N'Lidocain', N'Tê', N'Cho da', N'Ống tiêm', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với lithium', 20261),
    (N'Miconazil', N'Chống nấm', N'Cho nấm', N'Ống tiêm', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với aspirin', 7315),
    (N'Minoxidil', N'Rụng tóc', N'Kích thích mọc tóc', N'Ống tiêm', N'Dị ứng Minoxidil', N'Không tương tác đáng kể', 46776),
    (N'Mometasone', N'Corticosteroid', N'Cho viêm da', N'Dung dịch hít', N'Block tim', N'Không kết hợp rượu', 13271),
    (N'Mupirocin', N'Kháng sinh bôi', N'Cho vết thương', N'Gói bột', N'Bệnh gan hoạt động', N'Không tương tác đáng kể', 40274),
    (N'Povidone Iodine', N'Sát khuẩn', N'Cho da', N'Tiêm', N'Loét dạ dày', N'Tương tác với clopidogrel', 27004),
    (N'Salicylic acid', N'Bong tróc', N'Cho mụn', N'Gói bột', N'Block tim', N'Không kết hợp rượu', 11329),
    (N'Tretinoin', N'Retinoid', N'Cho mụn', N'Viên', N'Block tim', N'Tương tác với cimetidine', 43559),
    (N'Benzoyl peroxide', N'Trị mụn', N'Kháng khuẩn', N'Siro', N'Block tim', N'Tương tác với cimetidine', 48129),
    (N'Azelaic acid', N'Trị mụn', N'Cho rosacea', N'Siro', N'Suy thận nặng', N'Không kết hợp rượu', 5842),
    (N'Terbinafine', N'Chống nấm', N'Cho nấm da', N'Gói bột', N'Suy tim nặng', N'Tương tác với aspirin', 12200),
    (N'Sulfacetamide', N'Kháng sinh', N'Cho mắt da', N'Siro', N'Suy tim nặng', N'Tương tác với clopidogrel', 8809),
    (N'Tacrolimus', N'Ức chế miễn dịch', N'Cho eczema', N'Kem bôi', N'Suy thận nặng', N'Tương tác với clopidogrel', 29836),
    (N'Pimecrolimus', N'Ức chế miễn dịch', N'Cho eczema', N'Kem bôi', N'Dị ứng Pimecrolimus', N'Tương tác với warfarin', 43486),
    (N'Coal tar', N'Trị vảy nến', N'Bôi', N'Tiêm', N'Suy tim nặng', N'Tương tác với lithium', 47333),
    (N'Dithranol', N'Trị vảy nến', N'Bôi', N'Siro', N'Dị ứng penicillin', N'Không tương tác đáng kể', 23712),
    (N'Urea', N'Làm mềm da', N'Cho khô da', N'Tiêm', N'Bệnh gan hoạt động', N'Tương tác với cimetidine', 25329),
    (N'Ammonium lactate', N'Làm mềm da', N'Cho khô', N'Kem bôi', N'Suy tim nặng', N'Tương tác với propranolol', 22243),
    (N'Calamine', N'Chống ngứa', N'Cho da kích ứng', N'Dung dịch hít', N'Loét dạ dày', N'Tương tác với cimetidine', 43641),
    (N'Zinc oxide', N'Bảo vệ da', N'Cho tã', N'Ống tiêm', N'Block tim', N'Không tương tác đáng kể', 13146),
    (N'Silver sulfadiazine', N'Chống nhiễm', N'Cho bỏng', N'Viên', N'Không dùng cho trẻ em dưới 1 tuổi', N'Tương tác với warfarin', 9125),
    (N'Gentamicin bôi', N'Kháng sinh', N'Cho da', N'Kem bôi', N'Loét dạ dày', N'Tương tác với cimetidine', 36747),
    (N'Neomycin bôi', N'Kháng sinh', N'Cho da', N'Ống tiêm', N'Suy thận nặng', N'Tương tác với aspirin', 21234),
    (N'Bacitracin', N'Kháng sinh', N'Cho vết thương', N'Kem bôi', N'Suy tim nặng', N'Tương tác với propranolol', 9928),
    (N'Polymyxin B', N'Kháng sinh', N'Cho da', N'Ống tiêm', N'Loét dạ dày', N'Tương tác với aspirin', 32735),
    (N'Hydroquinone', N'Tẩy trắng', N'Cho nám', N'Tiêm', N'Không dùng cho trẻ em dưới 1 tuổi', N'Không kết hợp rượu', 31282),
    (N'Tazarotene', N'Retinoid', N'Cho vảy nến', N'Kem bôi', N'Bệnh gan hoạt động', N'Tương tác với cimetidine', 36502);
GO

-- Pass: thanh1111
INSERT INTO Account (RoleId, Username, Password, PhoneNumber, Email)
VALUES 
    -- Nhân viên
    (3, N'doctor1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0987654321', N'doctor_noi1@clinic.com'),
    (3, N'doctor2', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0987654322', N'doctor_noi2@clinic.com'),
    (3, N'doctor3', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0912345678', N'doctor_ngoai1@clinic.com'),
    (3, N'doctor4', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0967890123', N'doctor_nhi1@clinic.com'),
    (3, N'doctor5', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0955555555', N'doctor_lieu1@clinic.com'),
    (4, N'reception1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0945678901', N'reception1@clinic.com'),
    (5, N'labtech1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0956789012', N'labtech1@clinic.com'),
    
    -- Bệnh nhân
    (2, N'patient1', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0901234567', N'patient1@gmail.com'),
    (2, N'patient2', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0923456789', N'patient2@gmail.com'),
    (2, N'patient3', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0998765432', N'patient3@gmail.com'),
    (2, N'patient4', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0887654321', N'patient4@gmail.com'),
    (2, N'patient5', N'AQAAAAIAAYagAAAAEIPLzQ5eS2086qxT8rH8wcXS5STJbIKpgcBCBCRbDNyJtIEhDgcZDBwyfvTQS/MGNA==', N'0876543210', N'patient5@gmail.com');
GO

INSERT INTO Staff (AccountId, SpecialtyId, FullName, Expertise)
VALUES 
    (1, NULL, N'Nguyễn Văn Admin', N'Quản lý hệ thống'),			   -- Quản trị viên
    (2, 1, N'Nguyễn Thị Bình', N'Chuyên nội khoa tổng quát'),          -- Bác sĩ Nội khoa
    (3, 1, N'Trần Văn An', N'Chuyên tim mạch'),                        -- Bác sĩ Nội khoa
    (4, 2, N'Lê Thị Cường', N'Chuyên ngoại khoa tổng quát'),           -- Bác sĩ Ngoại khoa
    (5, 3, N'Phạm Văn Duy', N'Chuyên nhi khoa'),                       -- Bác sĩ Nhi khoa
    (6, 4, N'Hoàng Thị Lan', N'Chuyên da liễu'),                       -- Bác sĩ Da liễu
    (7, NULL, N'Kim Văn E', N'Lễ tân'),                                -- Lễ tân
    (8, 1, N'Hoàng Thị F', N'Kỹ thuật viên xét nghiệm');               -- Kỹ thuật viên xét nghiệm
GO

INSERT INTO Patient (AccountId, FullName, DateOfBirth, Address)
VALUES 
    (9, N'Huỳnh Văn I', '1985-05-15', N'123 Đường ABC, TP.HCM'),
    (10, N'Đặng Thị J', '1990-10-20', N'456 Đường DEF, Hà Nội'),
    (11, N'Bùi Văn K', '2000-01-01', N'789 Đường GHI, Đà Nẵng'),
    (12, N'Vũ Thị L', '1975-07-30', N'101 Đường JKL, Cần Thơ'),
    (13, N'Nguyễn Văn M', '1995-03-25', N'202 Đường MNO, Bình Dương');
GO

INSERT INTO Appointment (PatientId, StaffId, MedicalServiceId, AppointmentDate, AppointmentTime, Status)
VALUES 
    (1, 2, 1, '2025-09-20', '09:00:00', 1),  -- BN1, BS Nội 1, Khám nội tổng quát, Đã xác nhận
    (2, 4, 3, '2025-09-21', '10:30:00', 0),  -- BN2, BS Ngoại 1, Khám ngoại khoa, Chưa xác nhận
    (3, 5, 4, '2025-09-22', '14:00:00', 2),  -- BN3, BS Nhi 1, Khám nhi khoa, Đã hoàn thành
    (4, 6, 5, '2025-09-23', '15:30:00', 1),  -- BN4, BS Da liễu 1, Khám da liễu, Đã xác nhận
    (5, 2, 1, '2025-09-24', '08:00:00', 0),  -- BN5, BS Nội 1, Khám nội tổng quát, Chưa xác nhận
    (1, 3, 2, '2025-09-25', '11:00:00', 2),  -- BN1, BS Nội 2, Khám tim mạch, Đã hoàn thành
    (2, 5, 4, '2025-09-26', '13:00:00', 1);  -- BN2, BS Nhi 1, Khám nhi khoa, Đã xác nhận
GO

INSERT INTO PatientMedicalRecord (PatientId, StaffId, AppointmentId, Diagnosis, TreatmentMethod, RequiresTest, CreateAt, Status)
VALUES 
    (1, 2, 1, N'Viêm dạ dày cấp', N'Uống thuốc giảm acid và thay đổi chế độ ăn', 0, '2025-09-20T02:00:00Z', 1),  -- BN1, BS Nội 1, Viêm dạ dày
    (2, 4, 2, N'Trật khớp vai', N'Nắn chỉnh và băng cố định', 1, '2025-09-21T03:30:00Z', 1),               -- BN2, BS Ngoại 1, Trật khớp vai
    (3, 5, 3, N'Sốt xuất huyết', N'Theo dõi, bù dịch và hạ sốt', 1, '2025-09-22T07:00:00Z', 1),  -- BN3, BS Nhi 1, Sốt xuất huyết
    (4, 6, 4, N'Viêm da cơ địa', N'Kem bôi steroid và dưỡng ẩm', 0, '2025-09-23T08:30:00Z', 1),      -- BN4, BS Da liễu 1, Viêm da cơ địa
    (5, 2, 5, N'Cúm mùa', N'Nghỉ ngơi, uống thuốc hạ sốt và tăng cường vitamin', 0, '2025-09-24T01:00:00Z', 1),             -- BN5, BS Nội 1, Cúm mùa
    (1, 3, 6, N'Rối loạn nhịp tim', N'Thuốc điều hòa nhịp tim và theo dõi điện tim', 1, '2025-09-25T04:00:00Z', 1);  -- BN1, BS Nội 2, Rối loạn nhịp tim
GO

INSERT INTO Symptom (PatientMedicalRecordId, Name)
VALUES 
    (1, N'Đau thượng vị'),   -- Hồ sơ bệnh án 1, triệu chứng đau thượng vị
    (1, N'Ợ nóng'),     -- Hồ sơ bệnh án 1, triệu chứng ợ nóng
    (2, N'Đau vai'),    -- Hồ sơ bệnh án 2, triệu chứng đau vai
    (2, N'Khó cử động khớp vai'),
    (3, N'Sốt cao liên tục'),    -- Hồ sơ bệnh án 3, triệu chứng sốt cao
    (3, N'Phát ban'),
    (4, N'Ngứa da dữ dội'),  -- Hồ sơ bệnh án 4, triệu chứng ngứa da
    (4, N'Da khô'),
    (5, N'Ho khan'),   -- Hồ sơ bệnh án 5, triệu chứng ho khan
    (5, N'Sổ mũi'),
    (6, N'Đánh trống ngực'),    -- Hồ sơ bệnh án 6, triệu chứng đánh trống ngực
    (6, N'Mệt mỏi');    -- Hồ sơ bệnh án 6, triệu chứng mệt mỏi
GO

INSERT INTO TestResult (PatientMedicalRecordId, StaffId, Name, Image, Description, CreatedAt)
VALUES 
    (2, 8, N'X-quang tay', N'xray_tay.jpg', N'Gãy xương nhẹ', '2025-09-21T05:00:00Z'),  -- Kết quả xét nghiệm X-quang tay, kỹ thuật viên xét nghiệm
    (3, 8, N'Siêu âm bụng', N'sieuam_bung.jpg', N'Không bất thường', '2025-09-22T09:00:00Z'),  -- Kết quả xét nghiệm siêu âm bụng, kỹ thuật viên xét nghiệm
    (6, 8, N'Xét nghiệm máu', N'mau_test.jpg', N'Huyết áp cao', '2025-09-25T05:00:00Z');  -- Kết quả xét nghiệm máu, kỹ thuật viên xét nghiệm
GO

INSERT INTO Prescription (PatientMedicalRecordId, PrescriptionDate)
VALUES 
    (1, '2025-09-20T03:00:00Z'),  -- Đơn thuốc cho hồ sơ bệnh án 1
    (2, '2025-09-21T04:00:00Z'),  -- Đơn thuốc cho hồ sơ bệnh án 2
    (3, '2025-09-22T08:00:00Z'),  -- Đơn thuốc cho hồ sơ bệnh án 3
    (4, '2025-09-23T09:00:00Z'),  -- Đơn thuốc cho hồ sơ bệnh án 4
    (5, '2025-09-24T02:00:00Z'),  -- Đơn thuốc cho hồ sơ bệnh án 5
    (6, '2025-09-25T05:00:00Z');  -- Đơn thuốc cho hồ sơ bệnh án 6
GO

INSERT INTO PrescriptionDetail (PrescriptionId, MedicineId, Quantity, Dosage, Frequency, Amount)
VALUES 
    (1, 23, 14, N'1 viên/ngày', N'Trước ăn 30 phút', 406238),      -- Đơn thuốc 1, Omeprazole
    (1, 50, 20, N'1 viên khi đau', N'Khi cần', 859000),             -- Đơn thuốc 1, Paracetamol
    (2, 51, 15, N'1 viên x 2 lần/ngày', N'Sau ăn', 164340),         -- Đơn thuốc 2, Ibuprofen
    (3, 102, 10, N'1 gói khi sốt', N'Khi cần', 276160),             -- Đơn thuốc 3, Hapacol (Paracetamol nhi)
    (3, 110, 5, N'1 gói/lần x 2 lần/ngày', N'Pha với nước đun sôi để nguội', 62165), -- Đơn thuốc 3, Oresol
    (4, 172, 1, N'Bôi 2 lần/ngày', N'Sau khi làm sạch da', 34809),  -- Đơn thuốc 4, Ketoconazole (kem)
    (4, 170, 1, N'Bôi 1 lần/ngày', N'Vào buổi tối', 26370),        -- Đơn thuốc 4, Hydrocortisone (kem)
    (5, 50, 15, N'1 viên khi sốt/đau', N'Khi cần', 644250),         -- Đơn thuốc 5, Paracetamol
    (5, 2, 14, N'1 viên/ngày', N'Vào buổi sáng', 625660),           -- Đơn thuốc 5, Amlodipine
    (6, 2, 30, N'1 viên/ngày', N'Sáng', 1340700);                   -- Đơn thuốc 6, Amlodipine
GO

INSERT INTO Invoice (PatientMedicalRecordId, PaymentDate, TotalAmount, Status)
VALUES 
    (1, '2025-09-20T04:00:00Z', 1465238, 1),  -- Hóa đơn lịch hẹn 1, đơn thuốc 1, đã thanh toán (200000 + 406238 + 859000)
    (3, '2025-09-22T09:00:00Z', 488325, 1),   -- Hóa đơn lịch hẹn 3, đơn thuốc 3, đã thanh toán (150000 + 276160 + 62165)
    (4, '2025-09-23T09:30:00Z', 261179, 1),   -- Hóa đơn lịch hẹn 4, đơn thuốc 4, đã thanh toán (200000 + 34809 + 26370)
    (6, '2025-09-25T06:00:00Z', 1640700, 1);  -- Hóa đơn lịch hẹn 6, đơn thuốc 6, đã thanh toán (300000 + 1340700)
GO