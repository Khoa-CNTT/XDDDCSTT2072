import api from './api';

/**
 * Service xử lý các API liên quan đến thanh toán
 */
const PaymentService = {
  /**
   * Lấy danh sách tất cả các giao dịch thanh toán
   * @param {Object} params Tham số phân trang và lọc
   * @returns {Promise} Kết quả API
   */
  getAllPayments: async (params = {}) => {
    try {
      // Đảm bảo rằng các tham số không phải undefined
      const cleanParams = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
      
      console.log('Calling API: GET /payments/list with params:', cleanParams);
      const response = await api.get('/payments/list', { params: cleanParams });
      console.log('API Response raw:', response);
      
      // Thử cả hai cấu trúc dữ liệu có thể: data.content hoặc data.data.content
      let paymentsData = [];
      let totalElementsCount = 0;

      if (response.data?.content) {
        // Format 1: data.content trực tiếp
        paymentsData = response.data.content;
        totalElementsCount = response.data.totalElements || 0;
      } else if (response.data?.data?.content) {
        // Format 2: data.data.content (dùng ApiResponse wrapper)
        paymentsData = response.data.data.content;
        totalElementsCount = response.data.data.totalElements || 0;
      } else if (Array.isArray(response.data)) {
        // Format 3: Mảng trực tiếp
        paymentsData = response.data;
        totalElementsCount = response.data.length;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Format 4: data.data là một mảng
        paymentsData = response.data.data;
        totalElementsCount = response.data.data.length;
      }

      // Đảm bảo mỗi item trong mảng payments đều có thời gian
      if (paymentsData && paymentsData.length > 0) {
        console.log("Kiểm tra dữ liệu thời gian từ API");
        
        // Xử lý các giá trị thời gian
        paymentsData = paymentsData.map(payment => {
          // Kiểm tra và in chi tiết để phân tích
          console.log(`Processing payment ID: ${payment.id || 'unknown'}`);
          console.log(` - createdAt:`, payment.createdAt, typeof payment.createdAt);
          console.log(` - updatedAt:`, payment.updatedAt, typeof payment.updatedAt);
          
          // Xử lý createdAt array thành chuỗi ISO
          if (Array.isArray(payment.createdAt) && payment.createdAt.length >= 3) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = payment.createdAt;
            // Tháng trong JS bắt đầu từ 0, nhưng trong Java bắt đầu từ 1
            const adjustedMonth = month - 1;
            const isoDate = new Date(year, adjustedMonth, day, hour, minute, second);
            
            if (!isNaN(isoDate.getTime())) {
              // Chuyển thành chuỗi ISO
              payment.createdAt = isoDate.toISOString();
              console.log(` - createdAt converted:`, payment.createdAt);
            }
          }
          
          // Xử lý updatedAt array thành chuỗi ISO
          if (Array.isArray(payment.updatedAt) && payment.updatedAt.length >= 3) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = payment.updatedAt;
            // Tháng trong JS bắt đầu từ 0, nhưng trong Java bắt đầu từ 1
            const adjustedMonth = month - 1;
            const isoDate = new Date(year, adjustedMonth, day, hour, minute, second);
            
            if (!isNaN(isoDate.getTime())) {
              // Chuyển thành chuỗi ISO
              payment.updatedAt = isoDate.toISOString();
              console.log(` - updatedAt converted:`, payment.updatedAt);
            }
          }
          
          return payment;
        });
      }

      console.log("Processed payments data:", paymentsData);
      console.log("Total items:", totalElementsCount);
      
      // Kiểm tra định dạng thời gian trong response
      if (paymentsData && paymentsData.length > 0) {
        console.log('Mẫu dữ liệu thời gian từ API:', {
          createdAt: paymentsData[0].createdAt,
          updatedAt: paymentsData[0].updatedAt,
          type: typeof paymentsData[0].createdAt
        });
      }
      
      // Nếu đã xử lý dữ liệu từ API, trả về kết quả đã xử lý
      if (paymentsData && paymentsData.length > 0) {
        console.log('Trả về dữ liệu đã xử lý từ API');
        return {
          ...response,
          data: {
            content: paymentsData,
            totalElements: totalElementsCount,
            totalPages: Math.ceil(totalElementsCount / (params.size || 10)),
            number: params.page || 0,
            size: params.size || 10
          }
        };
      }
      
      // Nếu API trả về ApiResponse<Map<String, Object>> thì cần xử lý thêm
      if (response.data && response.data.data) {
        console.log('Returning data.data format');
        // Kiểm tra và đảm bảo các trường thời gian có định dạng chuẩn
        if (response.data.data.content && Array.isArray(response.data.data.content)) {
          response.data.data.content = response.data.data.content.map(item => {
            // Đảm bảo createdAt có dạng ISO string
            if (item.createdAt && typeof item.createdAt === 'string' && !item.createdAt.includes('T')) {
              // Nếu là định dạng date khác, chuyển thành ISO
              try {
                const date = new Date(item.createdAt);
                item.createdAt = date.toISOString();
              } catch (_) {
                console.error("Không thể chuyển đổi createdAt:", item.createdAt);
              }
            }
            
            // Đảm bảo updatedAt có dạng ISO string
            if (item.updatedAt && typeof item.updatedAt === 'string' && !item.updatedAt.includes('T')) {
              try {
                const date = new Date(item.updatedAt);
                item.updatedAt = date.toISOString();
              } catch (_) {
                console.error("Không thể chuyển đổi updatedAt:", item.updatedAt);
              }
            }
            
            return item;
          });
        }
        
        return {
          ...response,
          data: response.data.data
        };
      }
      
      // Tạo fake data tạm thời để debug UI
      if (!response.data || (response.data && !response.data.content && !Array.isArray(response.data))) {
        console.log('Creating fake data for UI debugging');
        
        // Dữ liệu mẫu ban đầu với các phương thức thanh toán khác nhau
        const allFakeData = [
          {
            id: 1,
            orderId: 123,
            amount: 100000,
            paymentMethod: 'VNPAY',
            status: 'COMPLETED',
            transactionId: 'VNP12345678',
            createdAt: '2023-11-15T08:30:45.123Z',
            updatedAt: '2023-11-15T08:30:45.123Z',
            description: 'Thanh toán đơn hàng #123'
          },
          {
            id: 2,
            orderId: 124,
            amount: 200000,
            paymentMethod: 'VNPAY',
            status: 'PENDING',
            transactionId: 'VNP12345679',
            createdAt: '2023-12-20T10:15:22.456Z',
            updatedAt: '2023-12-20T10:15:22.456Z',
            description: 'Thanh toán đơn hàng #124'
          },
          {
            id: 3,
            orderId: 125,
            amount: 300000,
            paymentMethod: 'MOMO',
            status: 'FAILED',
            transactionId: 'MM12345680',
            createdAt: '2024-01-17T14:45:30.789Z',
            updatedAt: '2024-01-17T14:45:30.789Z',
            description: 'Thanh toán đơn hàng #125'
          },
          {
            id: 4,
            orderId: 126,
            amount: 400000,
            paymentMethod: 'MOMO',
            status: 'COMPLETED',
            transactionId: 'MM12345681',
            createdAt: '2024-02-18T16:20:10.123Z',
            updatedAt: '2024-02-18T16:20:10.123Z',
            description: 'Thanh toán đơn hàng #126'
          },
          {
            id: 5,
            orderId: 127,
            amount: 500000,
            paymentMethod: 'COD',
            status: 'COMPLETED',
            transactionId: 'COD12345682',
            createdAt: '2024-03-19T09:05:55.456Z',
            updatedAt: '2024-03-19T09:05:55.456Z',
            description: 'Thanh toán đơn hàng #127'
          }
        ];
        
        // Lọc dữ liệu theo phương thức thanh toán nếu có tham số lọc
        let filteredData = [...allFakeData];
        
        // Lọc theo phương thức thanh toán
        if (cleanParams.paymentMethod) {
          console.log('Filtering by payment method:', cleanParams.paymentMethod);
          filteredData = filteredData.filter(item => {
            const match = item.paymentMethod === cleanParams.paymentMethod;
            console.log(`Item ${item.id} payment method: ${item.paymentMethod}, matches filter ${cleanParams.paymentMethod}: ${match}`);
            return match;
          });
        }
        
        // Lọc theo trạng thái
        if (cleanParams.status) {
          console.log('Filtering by status:', cleanParams.status);
          filteredData = filteredData.filter(item => 
            item.status === cleanParams.status
          );
        }
        
        // Lọc theo tìm kiếm
        if (cleanParams.search) {
          const searchLower = cleanParams.search.toLowerCase();
          filteredData = filteredData.filter(item => 
            item.transactionId.toLowerCase().includes(searchLower) ||
            item.orderId.toString().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower)
          );
        }
        
        const fakeData = {
          content: filteredData,
          totalElements: filteredData.length,
          totalPages: 1,
          number: 0,
          size: 10
        };
        
        console.log('Returning filtered fake data:', fakeData);
        return {
          ...response,
          data: fakeData
        };
      }
      
      console.log('Returning original response format');
      return response;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một giao dịch thanh toán
   * @param {string} paymentId ID của giao dịch
   * @returns {Promise} Kết quả API
   */
  getPaymentById: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment ${paymentId}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái giao dịch
   * @param {string} paymentId ID của giao dịch
   * @param {string} status Trạng thái mới
   * @returns {Promise} Kết quả API
   */
  updatePaymentStatus: async (paymentId, status) => {
    try {
      const response = await api.put(`/payments/${paymentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating payment ${paymentId} status:`, error);
      throw error;
    }
  },

  /**
   * Hoàn tiền giao dịch
   * @param {string} transactionId ID giao dịch
   * @param {number} amount Số tiền hoàn lại
   * @param {string} reason Lý do hoàn tiền
   * @returns {Promise} Kết quả API
   */
  refundPayment: async (transactionId, amount, reason) => {
    try {
      const response = await api.post('/payments/refund', {
        transactionId,
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error(`Error refunding payment ${transactionId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thống kê thanh toán
   * @param {Object} params Tham số lọc (theo ngày, tháng, năm)
   * @returns {Promise} Kết quả API
   */
  getPaymentStatistics: async (params = {}) => {
    try {
      // Đảm bảo rằng các tham số không phải undefined
      const cleanParams = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
      
      console.log('Calling API: GET /payments/statistics with params:', cleanParams);
      const response = await api.get('/payments/statistics', { params: cleanParams });
      console.log('Statistics API Response:', response);
      
      // Nếu API trả về ApiResponse<Map<String, Object>> thì cần xử lý thêm
      if (response.data && response.data.data) {
        return {
          ...response,
          data: response.data.data
        };
      }
      
      // Tạo dữ liệu mẫu để hiển thị UI
      if (!response.data || Object.keys(response.data).length === 0) {
        const fakeStatistics = {
          totalCount: 49,
          totalAmount: 2175000,
          completedCount: 5,
          pendingCount: 40,
          failedCount: 2,
          refundedCount: 2
        };
        
        return {
          ...response,
          data: fakeStatistics
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
      
      // Trả về dữ liệu mẫu khi có lỗi để không làm gián đoạn UI
      return {
        data: {
          totalCount: 49,
          totalAmount: 2175000,
          completedCount: 5,
          pendingCount: 40,
          failedCount: 2,
          refundedCount: 2
        }
      };
    }
  },

  /**
   * Xuất báo cáo thanh toán
   * @param {Object} params Tham số lọc (theo ngày, tháng, năm)
   * @returns {Promise} Kết quả API
   */
  exportPaymentsReport: async (params = {}) => {
    try {
      const response = await api.get('/payments/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting payment report:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái giao dịch bên VNPAY
   * @param {string} transactionRef Mã giao dịch VNPAY
   * @returns {Promise} Kết quả API
   */
  checkVnpayStatus: async (transactionRef) => {
    try {
      const response = await api.get(`/payments/query-dr?transactionId=${transactionRef}`);
      return response.data;
    } catch (error) {
      console.error(`Error checking VNPAY status for ${transactionRef}:`, error);
      throw error;
    }
  },

  /**
   * Lấy dữ liệu thống kê cho biểu đồ
   * @param {Object} params Tham số lọc (loại thống kê, ngày, phương thức thanh toán)
   * @returns {Promise} Kết quả API
   */
  getChartData: async (params = {}) => {
    try {
      // Đảm bảo rằng các tham số không phải undefined
      const cleanParams = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
      
      console.log('Calling API: GET /payments/chart-data with params:', cleanParams);
      
      // Gọi API thực từ server
      const response = await api.get('/payments/chart-data', { params: cleanParams });
      console.log('Chart data response from API:', response);
      
      // Kiểm tra cấu trúc response
      if (response.data && response.data.data) {
        // Nếu API trả về ApiResponse wrapper
        return {
          data: response.data.data
        };
      } else if (response.data) {
        // Nếu API trả về dữ liệu trực tiếp
        return {
          data: response.data
        };
      }
      
      // Nếu không có dữ liệu, trả về cấu trúc rỗng
      return {
        data: {
          labels: [],
          revenueData: [],
          transactionData: [],
          totalRevenue: 0,
          totalTransactions: 0,
          paymentMethodDistribution: {},
          statusDistribution: {}
        }
      };
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },
};

export default PaymentService; 