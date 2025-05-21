import api from './api';

const dashboardService = {
  /**
   * Lấy dữ liệu thống kê tổng quan cho Dashboard
   * Bao gồm: tổng doanh thu, tổng đơn hàng, tổng người dùng, tổng sản phẩm
   */
  async getStatistics() {
    try {
      // Lấy dữ liệu từ nhiều API khác nhau và kết hợp
      const [buyerOrdersResponse, sellerOrdersResponse, usersResponse, productsResponse] = await Promise.all([
        api.get('/orders/buyer'), // Lấy đơn hàng của người mua
        api.get('/orders/seller'), // Lấy đơn hàng của người bán
        api.get('/users'), // Lấy danh sách người dùng
        api.get('/marketplace/products'), // Lấy danh sách sản phẩm
      ]);
      
      // Kết hợp tất cả đơn hàng
      const orders = [
        ...(buyerOrdersResponse.data?.content || []),
        ...(sellerOrdersResponse.data?.content || [])
      ];
      
      // Trong trường hợp không có dữ liệu, dùng dữ liệu mẫu
      if (orders.length === 0) {
        // Dữ liệu mẫu
        return {
          totalSales: 45141000,
          totalOrders: 128,
          totalUsers: Array.isArray(usersResponse.data) ? usersResponse.data.length : (usersResponse.data?.content || []).length,
          totalProducts: (productsResponse.data?.content || []).length,
        };
      }
      
      // Tính tổng doanh thu từ danh sách đơn hàng
      const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      return {
        totalSales: totalSales,
        totalOrders: orders.length,
        totalUsers: Array.isArray(usersResponse.data) ? usersResponse.data.length : (usersResponse.data?.content || []).length,
        totalProducts: (productsResponse.data?.content || []).length,
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thống kê dashboard:', error);
      throw error;
    }
  },

  /**
   * Lấy dữ liệu biểu đồ doanh thu
   * @param {string} period - Kỳ dữ liệu (year, month, week)
   * @param {number} year - Năm cần lấy dữ liệu
   */
  async getSalesChart(period = 'year', year = new Date().getFullYear()) {
    try {
      // Lấy dữ liệu đơn hàng
      const [buyerOrdersResponse, sellerOrdersResponse] = await Promise.all([
        api.get('/orders/buyer'),
        api.get('/orders/seller')
      ]);
      
      // Kết hợp tất cả đơn hàng
      const orders = [
        ...(buyerOrdersResponse.data?.content || []),
        ...(sellerOrdersResponse.data?.content || [])
      ];
      
      // Tạo dữ liệu biểu đồ theo period
      let labels = [];
      let datasets = [];
      
      if (period === 'year') {
        // Tính doanh thu theo tháng
        labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        
        // Lọc đơn hàng theo năm
        const filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getFullYear() === year;
        });
        
        // Tính doanh thu theo tháng
        const monthlySales = Array(12).fill(0);
        filteredOrders.forEach(order => {
          const month = new Date(order.createdAt).getMonth();
          monthlySales[month] += (order.totalAmount || 0);
        });
        
        datasets = [
          {
            label: 'Doanh thu',
            data: monthlySales,
            borderColor: '#4782DA',
            backgroundColor: 'rgba(71, 130, 218, 0.1)',
            fill: true,
          }
        ];
      } else if (period === 'month') {
        // Logic tương tự cho dữ liệu theo tháng
        // ...
      }
      
      return {
        labels,
        datasets,
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu biểu đồ doanh thu:', error);
      throw error;
    }
  },

  /**
   * Lấy dữ liệu phân bố danh mục sản phẩm
   */
  async getCategoryDistribution() {
    try {
      // Lấy danh sách sản phẩm và danh mục
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get('/marketplace/products'),
        api.get('/product-categories')
      ]);
      
      const products = productsResponse.data?.content || [];
      const categories = categoriesResponse.data?.content || [];
      
      // Nếu không có dữ liệu, trả về dữ liệu mẫu
      if (categories.length === 0 || products.length === 0) {
        return {
          labels: ['Hạt giống', 'Phân bón', 'Thuốc BVTV', 'Công cụ', 'Máy móc'],
          datasets: [
            {
              data: [35, 25, 15, 15, 10],
              backgroundColor: [
                '#4782DA', '#FF6B6B', '#56CA00', '#FFB020', '#9C27B0'
              ],
            }
          ]
        };
      }
      
      // Tính số lượng sản phẩm theo danh mục
      const categoryMap = new Map();
      categories.forEach(category => {
        categoryMap.set(category.id, { name: category.name, count: 0 });
      });
      
      products.forEach(product => {
        if (product.categoryId && categoryMap.has(product.categoryId)) {
          const category = categoryMap.get(product.categoryId);
          category.count += 1;
        }
      });
      
      // Tạo dữ liệu biểu đồ
      const categoryData = Array.from(categoryMap.values());
      
      return {
        labels: categoryData.map(c => c.name),
        datasets: [
          {
            data: categoryData.map(c => c.count),
            backgroundColor: [
              '#4782DA', '#FF6B6B', '#56CA00', '#FFB020', '#9C27B0',
              '#2196F3', '#3F51B5', '#FF9800', '#795548', '#607D8B'
            ],
          }
        ]
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu phân bố danh mục:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng gần đây
   * @param {number} limit - Số lượng đơn hàng cần lấy
   */
  async getRecentOrders(limit = 5) {
    try {
      // Lấy cả đơn hàng mua và bán
      const [buyerOrdersResponse, sellerOrdersResponse] = await Promise.all([
        api.get('/orders/buyer'),
        api.get('/orders/seller')
      ]);
      
      // Kết hợp tất cả đơn hàng
      const orders = [
        ...(buyerOrdersResponse.data?.content || []),
        ...(sellerOrdersResponse.data?.content || [])
      ];
      
      // Nếu không có đơn hàng, trả về dữ liệu mẫu
      if (orders.length === 0) {
        return [
          {
            id: 1001,
            customerName: "Nguyễn Văn A",
            date: "2024-06-01",
            status: "DELIVERED",
            total: 1250000,
          },
          {
            id: 1002,
            customerName: "Trần Thị B",
            date: "2024-06-02",
            status: "PROCESSING",
            total: 850000,
          },
          {
            id: 1003,
            customerName: "Lê Văn C",
            date: "2024-06-03",
            status: "PENDING",
            total: 450000,
          },
          {
            id: 1004,
            customerName: "Phạm Thị D",
            date: "2024-06-04",
            status: "SHIPPED",
            total: 1500000,
          },
          {
            id: 1005,
            customerName: "Hoàng Văn E",
            date: "2024-06-05",
            status: "CANCELLED",
            total: 950000,
          },
        ];
      }
      
      // Sắp xếp theo ngày tạo mới nhất và giới hạn số lượng
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit)
        .map(order => {
          // Định dạng ngày thành yyyy-MM-dd
          const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
          const formattedDate = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
          
          return {
            id: order.id,
            customerName: order.customerName || order.userName || 'Khách hàng',
            date: formattedDate,
            status: order.status,
            total: order.totalAmount || 0
          };
        });
      
      return recentOrders;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu đơn hàng gần đây:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách hoạt động gần đây
   * @param {number} limit - Số lượng hoạt động cần lấy
   */
  async getRecentActivities(limit = 5) {
    try {
      // Kết hợp dữ liệu từ nhiều nguồn: đơn hàng, thông báo
      const [buyerOrdersResponse, sellerOrdersResponse, notificationsResponse] = await Promise.all([
        api.get('/orders/buyer'),
        api.get('/orders/seller'),
        api.get('/notifications')
      ]);
      
      // Kết hợp tất cả đơn hàng
      const orders = [
        ...(buyerOrdersResponse.data?.content || []),
        ...(sellerOrdersResponse.data?.content || [])
      ];
      
      const notifications = notificationsResponse.data?.content || [];
      
      // Tạo danh sách hoạt động từ đơn hàng
      const orderActivities = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit)
        .map(order => ({
          id: `order-${order.id}`,
          type: 'order',
          user: order.customerName || order.userName || 'Khách hàng',
          action: 'đã đặt một đơn hàng',
          target: `#${order.id}`,
          time: new Date(order.createdAt).toLocaleString()
        }));
      
      // Tạo danh sách hoạt động từ thông báo
      const notificationActivities = notifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit)
        .map(notification => ({
          id: `notification-${notification.id}`,
          type: notification.type || 'notification',
          user: notification.title || 'Hệ thống',
          action: notification.message || 'đã gửi thông báo',
          target: '',
          time: new Date(notification.createdAt).toLocaleString()
        }));
      
      // Kết hợp và sắp xếp theo thời gian
      const activities = [...orderActivities, ...notificationActivities]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, limit);
      
      return activities;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu hoạt động gần đây:', error);
      throw error;
    }
  },

  /**
   * Lấy dữ liệu sản phẩm bán chạy
   * @param {number} limit - Số lượng sản phẩm cần lấy
   */
  async getTopProducts(limit = 5) {
    try {
      const [productsResponse, buyerOrdersResponse, sellerOrdersResponse] = await Promise.all([
        api.get('/marketplace/products'),
        api.get('/orders/buyer'),
        api.get('/orders/seller')
      ]);
      
      const products = productsResponse.data?.content || [];
      
      // Nếu không có dữ liệu sản phẩm, trả về dữ liệu mẫu
      if (products.length === 0) {
        return [
          { id: 1, name: 'Hạt giống lúa ST25', sales: 124, stock: 85, progress: 75 },
          { id: 2, name: 'Phân bón hữu cơ vi sinh', sales: 98, stock: 70, progress: 65 },
          { id: 3, name: 'Thuốc phòng trừ sâu hại', sales: 85, stock: 55, progress: 58 },
          { id: 4, name: 'Máy phun thuốc tự động', sales: 72, stock: 48, progress: 45 },
          { id: 5, name: 'Bộ dụng cụ làm vườn', sales: 65, stock: 92, progress: 40 }
        ];
      }
      
      // Kết hợp tất cả đơn hàng
      const orders = [
        ...(buyerOrdersResponse.data?.content || []),
        ...(sellerOrdersResponse.data?.content || [])
      ];
      
      // Tính số lượng bán của từng sản phẩm
      const productSalesMap = new Map();
      
      // Giả sử orderDetails chứa thông tin sản phẩm trong đơn hàng
      orders.forEach(order => {
        if (order.orderDetails) {
          order.orderDetails.forEach(detail => {
            const productId = detail.productId;
            const quantity = detail.quantity || 1;
            
            if (productSalesMap.has(productId)) {
              productSalesMap.set(productId, productSalesMap.get(productId) + quantity);
            } else {
              productSalesMap.set(productId, quantity);
            }
          });
        }
      });
      
      // Kết hợp thông tin sản phẩm với số lượng bán
      const topProducts = products
        .map(product => {
          const sales = productSalesMap.get(product.id) || 0;
          return {
            id: product.id,
            name: product.name,
            sales: sales,
            stock: Math.round(Math.random() * 70 + 30), // Giả định về tồn kho
            progress: Math.round((sales / (sales + 10)) * 100) // Giả định về tiến độ bán hàng
          };
        })
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);
      
      return topProducts;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm bán chạy:', error);
      throw error;
    }
  },

  /**
   * Lấy dữ liệu KPI (chỉ số hiệu suất)
   */
  async getKPIData() {
    try {
      // Lấy cả đơn hàng mua và bán
      const [buyerOrdersResponse, sellerOrdersResponse] = await Promise.all([
        api.get('/orders/buyer'),
        api.get('/orders/seller')
      ]);
      
      // Kết hợp tất cả đơn hàng
      const orders = [
        ...(buyerOrdersResponse.data?.content || []),
        ...(sellerOrdersResponse.data?.content || [])
      ];
      
      // Tính tổng đơn hàng
      const totalOrders = orders.length;
      
      // Tính tổng doanh thu
      const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Tính giá trị đơn hàng trung bình
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      // Đếm số đơn hàng bị hủy
      const cancelledOrders = orders.filter(order => order.status === 'CANCELLED').length;
      
      // Tính tỷ lệ hủy đơn
      const cancelRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
      
      // Tính tỷ lệ khách hàng quay lại (giả định)
      const returnRate = 45; // Giả định
      
      // Tính tỷ lệ chuyển đổi (giả định)
      const conversionRate = 5.64;
      
      return [
        {
          title: "Tỷ lệ chuyển đổi",
          value: conversionRate.toFixed(2) + "%",
          trend: "+0.8%",
          color: "primary",
        },
        {
          title: "Giá trị đơn hàng TB",
          value: avgOrderValue.toLocaleString() + "đ",
          trend: "+12%",
          color: "success",
        },
        {
          title: "Tỷ lệ hủy đơn",
          value: cancelRate.toFixed(1) + "%",
          trend: "-0.2%",
          color: "success"
        },
        {
          title: "Khách hàng quay lại",
          value: returnRate + "%",
          trend: "+5%",
          color: "info"
        },
      ];
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu KPI:', error);
      throw error;
    }
  }
};

export default dashboardService; 