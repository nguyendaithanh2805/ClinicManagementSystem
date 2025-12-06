using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace Application.Utilities
{
    public class VnPayLibrary
    {
        private readonly SortedList<string, string> _requestData = 
            new SortedList<string, string>(StringComparer.Ordinal);

        private readonly SortedList<string, string> _responseData = 
            new SortedList<string, string>(StringComparer.Ordinal);

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _requestData.Add(key, value);
            }
        }

        public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
        {
            string rawData = string.Join("&",
                _requestData.Select(kv => $"{WebUtility.UrlEncode(kv.Key)}={WebUtility.UrlEncode(kv.Value)}")
            );

            string secureHash = HmacSHA512(vnp_HashSecret, rawData);

            // Build query with URL-Encode
            string query = string.Join("&",
                _requestData.Select(kv =>
                    WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value)
                )
            );

            return $"{baseUrl}?{query}&vnp_SecureHash={secureHash}";
        }

        public void AddResponseData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _responseData.Add(key, value);
            }
        }

        public string GetResponseData(string key)
        {
            return _responseData.TryGetValue(key, out var value) ? value : string.Empty;
        }

        public bool ValidateSignature(string inputHash, string secretKey)
        {
            string rspRaw = GetResponseData();
            string myChecksum = HmacSHA512(secretKey, rspRaw);
            return myChecksum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
        }

        private string GetResponseData()
        {
            StringBuilder data = new StringBuilder();

            if (_responseData.ContainsKey("vnp_SecureHashType"))
            {
                _responseData.Remove("vnp_SecureHashType");
            }
            if (_responseData.ContainsKey("vnp_SecureHash"))
            {
                _responseData.Remove("vnp_SecureHash");
            }

            foreach (KeyValuePair<string, string> kv in _responseData)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                }
            }

            // Xóa ký tự '&' cuối cùng
            if (data.Length > 0)
            {
                data.Remove(data.Length - 1, 1);
            }
            return data.ToString();
        }
        private static string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }
    }
}