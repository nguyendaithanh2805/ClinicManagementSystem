using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DTOs
{
    public class PatientDto
    {
        public int Id { get; set; }

        public int AccountId { get; set; }

        [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự.")]
        public string? FullName { get; set; }

        [DataType(DataType.Date)]
        public DateOnly? DateOfBirth { get; set; }

        [StringLength(200, ErrorMessage = "Địa chỉ không được vượt quá 200 ký tự.")]
        public string? Address { get; set; }
        public string? Email { get; set; }
        public ICollection<AppointmentWithPatientDto>? Appointments { get; set; }
    }
}
