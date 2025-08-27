using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class ClinicContextFactory : IDesignTimeDbContextFactory<ClinicContext>
    {
        public ClinicContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ClinicContext>();
            optionsBuilder.UseSqlServer("Server=DESKTOP-4QE7N69\\SQLEXPRESS;Database=ClinicDB;Trusted_Connection=True;TrustServerCertificate=True;");

            return new ClinicContext(optionsBuilder.Options);
        }
    }
}
