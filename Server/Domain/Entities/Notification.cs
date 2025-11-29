using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public int AccountId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }

        [JsonIgnore]
        public virtual Account Account { get; set; }
    }
}
