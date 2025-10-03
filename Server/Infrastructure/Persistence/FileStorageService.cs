using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Persistence
{
    public class FileStorageService : IFileStorageService
    {
        private readonly string _rootPath;

        public FileStorageService(IConfiguration configuration)
        {
            _rootPath = configuration["FileStorage:RootPath"]
                        ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

            if (!Directory.Exists(_rootPath))
                Directory.CreateDirectory(_rootPath);
        }

        public async Task<string> SaveFileAsync(Stream fileStream, string fileName)
        {
            string uniqueName = $"{Guid.NewGuid()}_{fileName}";
            string filePath = Path.Combine(_rootPath, uniqueName);

            using (var output = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(output);
            }

            return $"{uniqueName}";
        }

        public Task DeleteFileAsync(string filePath)
        {
            var fileName = Path.GetFileName(filePath); // chỉ lấy tên file
            var fullPath = Path.Combine(_rootPath, fileName);

            if (File.Exists(fullPath))
                File.Delete(fullPath);

            return Task.CompletedTask;
        }


        public string GetFileUrl(string filePath)
        {
            return $"/{filePath.Replace("\\", "/")}";
        }
    }
}
