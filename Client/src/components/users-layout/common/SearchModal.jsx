import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  User,
  Stethoscope,
  Calendar,
  MapPin,
  ArrowRight
} from 'lucide-react';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const popularSearches = [
    'Khám tim mạch',
    'Bác sĩ nhi khoa',
    'Đặt lịch khám',
    'Xét nghiệm máu',
    'Siêu âm thai',
    'Khám mắt',
    'Chụp X-quang',
    'Tư vấn dinh dưỡng'
  ];

  const recentSearches = [
    'BS. Nguyễn Văn An',
    'Khám tổng quát',
    'Giờ làm việc'
  ];

  const searchCategories = [
    {
      icon: User,
      title: 'Bác sĩ',
      results: [
        { name: 'BS.CKI Nguyễn Văn An', specialty: 'Tim Mạch', path: '/doctors/nguyen-van-an' },
        { name: 'BS.CKII Trần Thị Bình', specialty: 'Nhi Khoa', path: '/doctors/tran-thi-binh' },
        { name: 'BS.CKI Lê Minh Cường', specialty: 'Thần Kinh', path: '/doctors/le-minh-cuong' }
      ]
    },
    {
      icon: Stethoscope,
      title: 'Dịch vụ',
      results: [
        { name: 'Khám tim mạch', description: 'Chẩn đoán và điều trị bệnh lý tim mạch', path: '/services/cardiology' },
        { name: 'Khám nhi khoa', description: 'Chăm sóc sức khỏe trẻ em', path: '/services/pediatrics' },
        { name: 'Khám thần kinh', description: 'Điều trị các bệnh lý thần kinh', path: '/services/neurology' }
      ]
    },
    {
      icon: Calendar,
      title: 'Thông tin',
      results: [
        { name: 'Giờ làm việc', description: 'Thứ 2-6: 7:00-19:00, Thứ 7: 7:00-17:00', path: '/contact' },
        { name: 'Địa chỉ phòng khám', description: '123 Đường ABC, Quận 1, TP.HCM', path: '/contact' },
        { name: 'Số điện thoại', description: '0123-456-789', path: '/contact' }
      ]
    }
  ];

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsLoading(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        const filtered = searchCategories.map(category => ({
          ...category,
          results: category.results.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.specialty && item.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        })).filter(category => category.results.length > 0);
        
        setSearchResults(filtered);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleResultClick = (path) => {
    navigate(path);
    onClose();
    setSearchQuery('');
  };

  const handlePopularSearchClick = (query) => {
    setSearchQuery(query);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4 pt-16">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
          {/* Search Header */}
          <div className="flex items-center p-6 border-b border-gray-200">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bác sĩ, dịch vụ, thông tin..."
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Content */}
          <div className="max-h-96 overflow-y-auto">
            {searchQuery.length === 0 ? (
              <div className="p-6 space-y-6">
                {/* Popular Searches */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Tìm kiếm phổ biến</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handlePopularSearchClick(search)}
                        className="px-3 py-2 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-lg text-sm transition-colors duration-200"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Tìm kiếm gần đây</h3>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handlePopularSearchClick(search)}
                        className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-6">
                    {searchResults.map((category, categoryIndex) => (
                      <div key={categoryIndex}>
                        <div className="flex items-center space-x-2 mb-3">
                          <category.icon className="w-5 h-5 text-primary-600" />
                          <h3 className="font-semibold text-gray-900">{category.title}</h3>
                        </div>
                        <div className="space-y-2">
                          {category.results.map((result, resultIndex) => (
                            <button
                              key={resultIndex}
                              onClick={() => handleResultClick(result.path)}
                              className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
                            >
                              <div>
                                <h4 className="font-medium text-gray-900 group-hover:text-primary-600">
                                  {result.name}
                                </h4>
                                {(result.specialty || result.description) && (
                                  <p className="text-sm text-gray-600">
                                    {result.specialty || result.description}
                                  </p>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không tìm thấy kết quả
                    </h3>
                    <p className="text-gray-600">
                      Thử tìm kiếm với từ khóa khác hoặc liên hệ với chúng tôi để được hỗ trợ
                    </p>
                    <button
                      onClick={() => navigate('/contact')}
                      className="mt-4 btn-primary"
                    >
                      Liên hệ hỗ trợ
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>123 Đường ABC, Quận 1</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>7:00 - 19:00</span>
                </div>
              </div>
              <span>Nhấn ESC để đóng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;