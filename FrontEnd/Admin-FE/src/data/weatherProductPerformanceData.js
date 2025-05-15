/**
 * Dữ liệu mẫu phân tích hiệu suất sản phẩm theo thời tiết
 * Cấu trúc: productId => region => period => data
 */

const weatherProductPerformanceData = {
  // Sản phẩm: Hạt giống lúa (ID: 1)
  1: {
    // Khu vực: Miền Bắc
    "north": {
      // Khoảng thời gian: 3 tháng
      3: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 88.5,
              salesVolume: 130,
              averageRating: 4.3,
              trend: "Tăng"
            },
            "Mưa nhẹ": {
              averagePerformance: 92.0,
              salesVolume: 155,
              averageRating: 4.5,
              trend: "Tăng"
            },
            "Nắng vừa": {
              averagePerformance: 75.0,
              salesVolume: 95,
              averageRating: 3.8,
              trend: "Giảm"
            },
            "Mưa vừa": {
              averagePerformance: 85.0,
              salesVolume: 110,
              averageRating: 4.1,
              trend: "Ổn định"
            }
          },
          temperaturePerformance: {
            "15-20°C": 90.0,
            "20-25°C": 92.0,
            "25-30°C": 75.0,
            "30-35°C": 65.0,
            ">35°C": 55.0
          },
          humidityPerformance: {
            "<40%": 62.0,
            "40-60%": 75.0,
            "60-80%": 92.0,
            ">80%": 88.0
          },
          seasonalPerformance: {
            "Xuân": 92.0,
            "Hè": 75.0,
            "Thu": 80.0,
            "Đông": 88.0
          },
          optimalConditions: {
            weather: "Mưa nhẹ",
            temperature: "20-25°C",
            humidity: "60-80%",
            season: "Xuân"
          }
        },
        optimizationTips: [
          "Sử dụng giống lúa phù hợp với điều kiện mưa nhẹ để đạt hiệu suất tối đa",
          "Nhiệt độ tối ưu: 20-25°C - tăng hiệu suất lên đến 20% so với nhiệt độ cao hơn",
          "Độ ẩm đất nên duy trì ở mức 60-80% để tối ưu quá trình nảy mầm",
          "Nên trồng vào mùa xuân để đạt hiệu suất cao nhất (92%)",
          "Cải thiện hệ thống thoát nước để đối phó với thời tiết mưa nhiều"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 3, 1).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 22.5,
              humidity: 75,
              performance: 93.0
            },
            {
              date: new Date(2023, 3, 2).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 23.0,
              humidity: 72,
              performance: 92.5
            },
            {
              date: new Date(2023, 3, 3).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 24.0,
              humidity: 68,
              performance: 89.0
            },
            {
              date: new Date(2023, 3, 4).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 25.0,
              humidity: 65,
              performance: 87.5
            },
            {
              date: new Date(2023, 3, 5).toISOString(),
              weather: "Nắng vừa",
              temperature: 27.0,
              humidity: 60,
              performance: 75.0
            },
            {
              date: new Date(2023, 3, 6).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 22.0,
              humidity: 76,
              performance: 92.0
            },
            {
              date: new Date(2023, 3, 7).toISOString(),
              weather: "Mưa vừa",
              temperature: 21.0,
              humidity: 82,
              performance: 85.0
            }
          ],
          averagePerformance: 87.7,
          trend: "Tăng",
          usageRecommendations: [
            "Ngày tối ưu để gieo hạt: 01/04/2023 (hiệu suất dự kiến: 93.0%)",
            "Điều chỉnh lịch gieo trồng dựa trên dự báo mưa nhẹ trong những ngày đầu tháng",
            "Chuẩn bị hệ thống tưới tiêu để đối phó với giai đoạn nắng vừa vào giữa tuần"
          ]
        }
      },
      // Khoảng thời gian: 6 tháng
      6: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 86.0,
              salesVolume: 420,
              averageRating: 4.2,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 90.0,
              salesVolume: 480,
              averageRating: 4.4,
              trend: "Tăng"
            },
            "Nắng vừa": {
              averagePerformance: 72.0,
              salesVolume: 310,
              averageRating: 3.7,
              trend: "Giảm"
            },
            "Mưa vừa": {
              averagePerformance: 83.0,
              salesVolume: 360,
              averageRating: 4.0,
              trend: "Ổn định"
            }
          },
          temperaturePerformance: {
            "15-20°C": 88.0,
            "20-25°C": 91.0,
            "25-30°C": 73.0,
            "30-35°C": 63.0,
            ">35°C": 50.0
          },
          humidityPerformance: {
            "<40%": 58.0,
            "40-60%": 72.0,
            "60-80%": 90.0,
            ">80%": 85.0
          },
          seasonalPerformance: {
            "Xuân": 90.0,
            "Hè": 70.0,
            "Thu": 82.0,
            "Đông": 85.0
          },
          optimalConditions: {
            weather: "Mưa nhẹ",
            temperature: "20-25°C",
            humidity: "60-80%",
            season: "Xuân"
          }
        },
        optimizationTips: [
          "Ưu tiên gieo trồng trong điều kiện mưa nhẹ để đạt hiệu suất 90%",
          "Bón phân phù hợp với điều kiện thời tiết và giai đoạn phát triển của cây",
          "Duy trì độ ẩm đất 60-80% bằng hệ thống tưới tiêu hiệu quả",
          "Điều chỉnh lịch gieo trồng theo mùa vụ, ưu tiên mùa xuân",
          "Chuẩn bị biện pháp phòng chống bệnh đạo ôn khi độ ẩm cao"
        ],
        futurePredictions: {
          // Tương tự như trên nhưng cho 6 tháng
          performancePredictions: [
            {
              date: new Date(2023, 3, 1).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 22.5,
              humidity: 75,
              performance: 92.0
            },
            // ... thêm dữ liệu tương tự
          ],
          averagePerformance: 85.5,
          trend: "Ổn định",
          usageRecommendations: [
            "Lập kế hoạch gieo trồng 6 tháng với ít nhất 70% diện tích vào mùa xuân",
            "Chuẩn bị phương án dự phòng cho thời tiết bất thường"
          ]
        }
      },
      // Khoảng thời gian: 12 tháng
      12: {
        // Dữ liệu tương tự nhưng cho 12 tháng
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 84.0,
              salesVolume: 850,
              averageRating: 4.1,
              trend: "Ổn định"
            },
            // ... thêm dữ liệu tương tự
          },
          // ... thêm dữ liệu tương tự
        },
        // ... thêm dữ liệu tương tự
      }
    },
    // Thêm dữ liệu cho các khu vực khác
    "central": {
      // Dữ liệu tương tự cho Miền Trung
      3: { /* ... */ },
      6: { /* ... */ },
      12: { /* ... */ }
    },
    "south": {
      // Dữ liệu tương tự cho Miền Nam
      3: { /* ... */ },
      6: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 80.0,
              salesVolume: 380,
              averageRating: 4.0,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 85.0,
              salesVolume: 450,
              averageRating: 4.3,
              trend: "Tăng"
            },
            "Nắng vừa": {
              averagePerformance: 75.0,
              salesVolume: 320,
              averageRating: 3.8,
              trend: "Ổn định"
            },
            "Mưa vừa": {
              averagePerformance: 78.0,
              salesVolume: 340,
              averageRating: 3.9,
              trend: "Ổn định"
            }
          },
          temperaturePerformance: {
            "15-20°C": 70.0,
            "20-25°C": 82.0,
            "25-30°C": 85.0,
            "30-35°C": 75.0,
            ">35°C": 60.0
          },
          humidityPerformance: {
            "<40%": 55.0,
            "40-60%": 70.0,
            "60-80%": 85.0,
            ">80%": 80.0
          },
          seasonalPerformance: {
            "Xuân": 82.0,
            "Hè": 75.0,
            "Thu": 85.0,
            "Đông": 78.0
          },
          optimalConditions: {
            weather: "Mưa nhẹ",
            temperature: "25-30°C",
            humidity: "60-80%",
            season: "Thu"
          }
        },
        optimizationTips: [
          "Ưu tiên gieo trồng vào mùa thu tại miền Nam để đạt hiệu suất tối ưu",
          "Sử dụng giống lúa phù hợp với nhiệt độ 25-30°C của miền Nam",
          "Duy trì độ ẩm 60-80% thông qua hệ thống tưới tiêu hiệu quả",
          "Ứng dụng biện pháp che phủ khi nhiệt độ vượt quá 30°C",
          "Lập kế hoạch phòng trừ sâu bệnh phù hợp với điều kiện nhiệt đới"
        ],
        futurePredictions: {
          // Dữ liệu dự đoán
          performancePredictions: [
            // ... thêm dữ liệu tương tự
          ],
          averagePerformance: 82.0,
          trend: "Ổn định",
          usageRecommendations: [
            // ... thêm dữ liệu tương tự
          ]
        }
      },
      12: { /* ... */ }
    },
    "highlands": {
      // Dữ liệu tương tự cho Tây Nguyên
      3: { /* ... */ },
      6: { /* ... */ },
      12: { /* ... */ }
    }
  },
  
  // Sản phẩm: Phân bón NPK (ID: 2)
  2: {
    // Dữ liệu tương tự cho từng khu vực và khoảng thời gian
    "north": {
      3: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 88.0,
              salesVolume: 200,
              averageRating: 4.4,
              trend: "Tăng"
            },
            "Mưa nhẹ": {
              averagePerformance: 92.0,
              salesVolume: 240,
              averageRating: 4.6,
              trend: "Tăng"
            },
            "Nắng vừa": {
              averagePerformance: 80.0,
              salesVolume: 180,
              averageRating: 4.1,
              trend: "Ổn định"
            },
            "Mưa vừa": {
              averagePerformance: 75.0,
              salesVolume: 150,
              averageRating: 3.9,
              trend: "Giảm"
            }
          },
          temperaturePerformance: {
            "15-20°C": 85.0,
            "20-25°C": 92.0,
            "25-30°C": 88.0,
            "30-35°C": 75.0,
            ">35°C": 65.0
          },
          humidityPerformance: {
            "<40%": 70.0,
            "40-60%": 85.0,
            "60-80%": 92.0,
            ">80%": 78.0
          },
          seasonalPerformance: {
            "Xuân": 92.0,
            "Hè": 80.0,
            "Thu": 85.0,
            "Đông": 75.0
          },
          optimalConditions: {
            weather: "Mưa nhẹ",
            temperature: "20-25°C",
            humidity: "60-80%",
            season: "Xuân"
          }
        },
        optimizationTips: [
          "Sử dụng phân bón NPK khi có mưa nhẹ để tăng hiệu quả hấp thụ",
          "Bón phân vào buổi sáng sớm hoặc chiều muộn khi nhiệt độ 20-25°C",
          "Đảm bảo đất có độ ẩm 60-80% trước khi bón phân",
          "Kết hợp với các biện pháp giữ ẩm đất để tăng hiệu quả của phân bón",
          "Phân chia liều lượng bón thành nhiều lần nhỏ trong mùa xuân"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 3, 1).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 22.0,
              humidity: 75,
              performance: 93.0
            },
            // ... thêm dữ liệu tương tự
          ],
          averagePerformance: 88.5,
          trend: "Tăng",
          usageRecommendations: [
            "Lập lịch bón phân vào ngày 01/04/2023 khi có mưa nhẹ",
            "Điều chỉnh lượng phân bón tăng 10% vào các ngày có mưa nhẹ",
            "Giảm 20% lượng phân bón vào các ngày có nhiệt độ trên 30°C"
          ]
        }
      },
      6: { /* ... */ },
      12: { /* ... */ }
    },
    // Thêm dữ liệu cho các khu vực khác
  },
  
  // Sản phẩm: Thuốc trừ sâu (ID: 3)
  3: {
    // Khu vực: Miền Bắc
    "north": {
      // Khoảng thời gian: 3 tháng
      3: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 82.5,
              salesVolume: 180,
              averageRating: 4.1,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 88.0,
              salesVolume: 220,
              averageRating: 4.3,
              trend: "Tăng"
            },
            "Nắng vừa": {
              averagePerformance: 75.0,
              salesVolume: 150,
              averageRating: 3.8,
              trend: "Giảm"
            },
            "Mưa vừa": {
              averagePerformance: 90.0,
              salesVolume: 240,
              averageRating: 4.5,
              trend: "Tăng"
            }
          },
          temperaturePerformance: {
            "15-20°C": 78.0,
            "20-25°C": 85.0,
            "25-30°C": 88.0,
            "30-35°C": 80.0,
            ">35°C": 65.0
          },
          humidityPerformance: {
            "<40%": 65.0,
            "40-60%": 78.0,
            "60-80%": 85.0,
            ">80%": 90.0
          },
          seasonalPerformance: {
            "Xuân": 85.0,
            "Hè": 90.0,
            "Thu": 82.0,
            "Đông": 75.0
          },
          optimalConditions: {
            weather: "Mưa vừa",
            temperature: "25-30°C",
            humidity: ">80%",
            season: "Hè"
          }
        },
        optimizationTips: [
          "Phun thuốc trong điều kiện mưa vừa để tăng hiệu quả diệt trừ sâu bệnh",
          "Nhiệt độ tối ưu 25-30°C giúp thuốc phát huy tác dụng nhanh hơn 20%",
          "Độ ẩm cao trên 80% tạo điều kiện thuận lợi cho thuốc bám dính trên lá",
          "Nên phun thuốc vào đầu mùa hè khi sâu bệnh phát triển mạnh",
          "Phun thuốc vào buổi chiều mát để giảm bay hơi và tăng hiệu quả",
          "Sử dụng kết hợp với các chất bám dính khi phun trong điều kiện mưa"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 5, 1).toISOString(),
              weather: "Mưa vừa",
              temperature: 27.0,
              humidity: 85,
              performance: 91.0
            },
            {
              date: new Date(2023, 5, 2).toISOString(),
              weather: "Mưa vừa",
              temperature: 26.5,
              humidity: 88,
              performance: 92.5
            },
            {
              date: new Date(2023, 5, 3).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 28.0,
              humidity: 80,
              performance: 89.0
            },
            {
              date: new Date(2023, 5, 4).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 29.0,
              humidity: 75,
              performance: 83.0
            },
            {
              date: new Date(2023, 5, 5).toISOString(),
              weather: "Nắng vừa",
              temperature: 31.0,
              humidity: 70,
              performance: 75.0
            },
            {
              date: new Date(2023, 5, 6).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 27.0,
              humidity: 82,
              performance: 87.0
            },
            {
              date: new Date(2023, 5, 7).toISOString(),
              weather: "Mưa vừa",
              temperature: 26.0,
              humidity: 90,
              performance: 91.0
            }
          ],
          averagePerformance: 86.9,
          trend: "Tăng",
          usageRecommendations: [
            "Lên lịch phun thuốc vào ngày 02/06/2023 khi có mưa vừa và độ ẩm 88%",
            "Tăng nồng độ thuốc 5-10% nếu phun vào ngày có nắng để bù đắp tác dụng giảm",
            "Hạn chế phun thuốc vào ngày 05/06/2023 do thời tiết nắng vừa làm giảm hiệu quả",
            "Chuẩn bị phương án dự phòng cho các đợt mưa lớn để đảm bảo thuốc không bị trôi"
          ]
        }
      },
      // Khoảng thời gian: 6 tháng
      6: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 80.0,
              salesVolume: 520,
              averageRating: 4.0,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 85.0,
              salesVolume: 650,
              averageRating: 4.2,
              trend: "Tăng"
            },
            "Nắng vừa": {
              averagePerformance: 72.0,
              salesVolume: 420,
              averageRating: 3.6,
              trend: "Giảm"
            },
            "Mưa vừa": {
              averagePerformance: 88.0,
              salesVolume: 720,
              averageRating: 4.4,
              trend: "Tăng"
            }
          },
          temperaturePerformance: {
            "15-20°C": 75.0,
            "20-25°C": 82.0,
            "25-30°C": 86.0,
            "30-35°C": 78.0,
            ">35°C": 60.0
          },
          humidityPerformance: {
            "<40%": 60.0,
            "40-60%": 75.0,
            "60-80%": 84.0,
            ">80%": 88.0
          },
          seasonalPerformance: {
            "Xuân": 83.0,
            "Hè": 88.0,
            "Thu": 80.0,
            "Đông": 73.0
          },
          optimalConditions: {
            weather: "Mưa vừa",
            temperature: "25-30°C",
            humidity: ">80%",
            season: "Hè"
          }
        },
        optimizationTips: [
          "Tập trung chiến dịch phun thuốc trong mùa hè khi hiệu suất đạt 88%",
          "Ưu tiên phun thuốc trong thời tiết có mưa vừa, đặc biệt khi độ ẩm trên 80%",
          "Bổ sung các phương án bảo vệ thuốc khi phun vào mùa mưa nhiều",
          "Điều chỉnh thời gian phun thuốc vào buổi sáng sớm hoặc chiều mát",
          "Giảm 20% lượng thuốc sử dụng trong điều kiện mưa so với điều kiện nắng",
          "Kết hợp thuốc trừ sâu với thuốc phòng nấm bệnh trong thời tiết mưa ẩm cao"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 5, 1).toISOString(),
              weather: "Mưa vừa",
              temperature: 27.0,
              humidity: 85,
              performance: 90.0
            },
            {
              date: new Date(2023, 5, 2).toISOString(),
              weather: "Mưa vừa",
              temperature: 26.5,
              humidity: 88,
              performance: 91.0
            },
            {
              date: new Date(2023, 5, 3).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 28.0,
              humidity: 80,
              performance: 86.5
            },
            {
              date: new Date(2023, 5, 4).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 29.0,
              humidity: 75,
              performance: 81.0
            },
            {
              date: new Date(2023, 5, 5).toISOString(),
              weather: "Nắng vừa",
              temperature: 31.0,
              humidity: 70,
              performance: 72.0
            },
            {
              date: new Date(2023, 5, 6).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 27.0,
              humidity: 82,
              performance: 85.0
            },
            {
              date: new Date(2023, 5, 7).toISOString(),
              weather: "Mưa vừa",
              temperature: 26.0,
              humidity: 90,
              performance: 89.0
            }
          ],
          averagePerformance: 84.9,
          trend: "Ổn định",
          usageRecommendations: [
            "Tập trung phun thuốc vào hai ngày đầu tháng 6 khi hiệu suất đạt trên 90%",
            "Lập kế hoạch dự phòng cho ngày 5/6 khi hiệu suất thấp nhất (72%)",
            "Đảm bảo nguồn cung thuốc trừ sâu dồi dào vào mùa mưa để đáp ứng nhu cầu tăng cao",
            "Chuẩn bị các biện pháp phòng trừ sâu bệnh tổng hợp cho cả 6 tháng tới"
          ]
        }
      },
      // Khoảng thời gian: 12 tháng
      12: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 79.0,
              salesVolume: 980,
              averageRating: 3.9,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 84.0,
              salesVolume: 1250,
              averageRating: 4.1,
              trend: "Ổn định"
            },
            "Nắng vừa": {
              averagePerformance: 70.0,
              salesVolume: 820,
              averageRating: 3.5,
              trend: "Giảm"
            },
            "Mưa vừa": {
              averagePerformance: 86.0,
              salesVolume: 1380,
              averageRating: 4.3,
              trend: "Tăng"
            }
          },
          temperaturePerformance: {
            "15-20°C": 72.0,
            "20-25°C": 80.0,
            "25-30°C": 85.0,
            "30-35°C": 75.0,
            ">35°C": 58.0
          },
          humidityPerformance: {
            "<40%": 58.0,
            "40-60%": 72.0,
            "60-80%": 82.0,
            ">80%": 86.0
          },
          seasonalPerformance: {
            "Xuân": 81.0,
            "Hè": 86.0,
            "Thu": 79.0,
            "Đông": 71.0
          },
          optimalConditions: {
            weather: "Mưa vừa",
            temperature: "25-30°C",
            humidity: ">80%",
            season: "Hè"
          }
        },
        optimizationTips: [
          "Xây dựng chiến lược phun thuốc trừ sâu theo mùa vụ, tập trung vào mùa hè",
          "Lập kế hoạch dự trữ thuốc trừ sâu trước mùa mưa để đảm bảo nguồn cung",
          "Điều chỉnh công thức thuốc phù hợp với từng mùa và điều kiện thời tiết",
          "Áp dụng công nghệ dự báo thời tiết để tối ưu thời điểm phun thuốc",
          "Đa dạng hóa sản phẩm để phù hợp với các loại thời tiết khác nhau",
          "Nghiên cứu và phát triển công thức chống trôi rửa để sử dụng trong mùa mưa"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 5, 1).toISOString(),
              weather: "Mưa vừa",
              temperature: 27.0,
              humidity: 85,
              performance: 87.0
            },
            {
              date: new Date(2023, 5, 2).toISOString(),
              weather: "Mưa vừa",
              temperature: 26.5,
              humidity: 88,
              performance: 88.0
            },
            {
              date: new Date(2023, 5, 3).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 28.0,
              humidity: 80,
              performance: 85.0
            },
            {
              date: new Date(2023, 5, 4).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 29.0,
              humidity: 75,
              performance: 80.0
            },
            {
              date: new Date(2023, 5, 5).toISOString(),
              weather: "Nắng vừa",
              temperature: 31.0,
              humidity: 70,
              performance: 71.0
            },
            {
              date: new Date(2023, 5, 6).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 27.0,
              humidity: 82,
              performance: 84.0
            },
            {
              date: new Date(2023, 5, 7).toISOString(),
              weather: "Mưa vừa",
              temperature: 26.0,
              humidity: 90,
              performance: 87.0
            }
          ],
          averagePerformance: 83.1,
          trend: "Ổn định",
          usageRecommendations: [
            "Phân bổ ngân sách marketing theo mùa vụ, tập trung vào mùa mưa",
            "Phát triển chiến lược phân phối theo vùng miền dựa trên dữ liệu thời tiết dài hạn",
            "Triển khai chương trình khuyến mãi theo dự báo thời tiết hàng quý",
            "Đào tạo nông dân về cách sử dụng thuốc trừ sâu hiệu quả trong từng điều kiện thời tiết"
          ]
        }
      }
    },
    // Khu vực: Miền Trung
    "central": {
      // Khoảng thời gian: 3 tháng
      3: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 78.0,
              salesVolume: 160,
              averageRating: 3.9,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 85.0,
              salesVolume: 210,
              averageRating: 4.2,
              trend: "Tăng"
            },
            "Nắng vừa": {
              averagePerformance: 72.0,
              salesVolume: 140,
              averageRating: 3.6,
              trend: "Giảm"
            },
            "Mưa vừa": {
              averagePerformance: 92.0,
              salesVolume: 270,
              averageRating: 4.6,
              trend: "Tăng"
            }
          },
          temperaturePerformance: {
            "15-20°C": 75.0,
            "20-25°C": 82.0,
            "25-30°C": 90.0,
            "30-35°C": 75.0,
            ">35°C": 60.0
          },
          humidityPerformance: {
            "<40%": 62.0,
            "40-60%": 75.0,
            "60-80%": 88.0,
            ">80%": 92.0
          },
          seasonalPerformance: {
            "Xuân": 80.0,
            "Hè": 85.0,
            "Thu": 92.0,
            "Đông": 76.0
          },
          optimalConditions: {
            weather: "Mưa vừa",
            temperature: "25-30°C",
            humidity: ">80%",
            season: "Thu"
          }
        },
        optimizationTips: [
          "Sử dụng thuốc trừ sâu tại miền Trung hiệu quả nhất trong mùa thu với mưa vừa",
          "Nhiệt độ 25-30°C kết hợp với độ ẩm trên 80% giúp thuốc phát huy hiệu quả tối đa",
          "Áp dụng kỹ thuật phun sương mịn khi sử dụng trong điều kiện nắng vừa",
          "Hạn chế sử dụng khi nhiệt độ vượt quá 35°C do hiệu quả giảm 30%",
          "Ưu tiên phun thuốc sau các đợt mưa nhẹ khi đất còn ẩm, tránh thời điểm nắng gắt"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 8, 1).toISOString(),
              weather: "Mưa vừa",
              temperature: 26.0,
              humidity: 88,
              performance: 93.0
            },
            {
              date: new Date(2023, 8, 2).toISOString(),
              weather: "Mưa vừa",
              temperature: 25.5,
              humidity: 90,
              performance: 92.5
            },
            {
              date: new Date(2023, 8, 3).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 27.0,
              humidity: 85,
              performance: 86.0
            },
            {
              date: new Date(2023, 8, 4).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 28.0,
              humidity: 78,
              performance: 79.0
            },
            {
              date: new Date(2023, 8, 5).toISOString(),
              weather: "Nắng vừa",
              temperature: 30.0,
              humidity: 72,
              performance: 73.0
            },
            {
              date: new Date(2023, 8, 6).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 26.0,
              humidity: 80,
              performance: 85.0
            },
            {
              date: new Date(2023, 8, 7).toISOString(),
              weather: "Mưa vừa",
              temperature: 25.0,
              humidity: 92,
              performance: 92.0
            }
          ],
          averagePerformance: 85.8,
          trend: "Tăng",
          usageRecommendations: [
            "Tập trung phun thuốc vào 2 ngày đầu tháng 9 với hiệu suất trên 92%",
            "Ưu tiên mua hàng và dự trữ trước mùa thu để đảm bảo nguồn cung",
            "Kết hợp với các chất bám dính khi phun trong điều kiện mưa vừa",
            "Áp dụng kỹ thuật phun sương mịn khi sử dụng vào ngày nắng"
          ]
        }
      },
      // Khoảng thời gian: 6 tháng
      6: { /* ... */ },
      // Khoảng thời gian: 12 tháng
      12: { /* ... */ }
    },
    // Khu vực: Miền Nam
    "south": {
      // Khoảng thời gian: 3 tháng
      3: { /* ... */ },
      // Khoảng thời gian: 6 tháng
      6: { /* ... */ },
      // Khoảng thời gian: 12 tháng
      12: { /* ... */ }
    },
    // Khu vực: Tây Nguyên
    "highlands": {
      // Khoảng thời gian: 3 tháng
      3: { /* ... */ },
      // Khoảng thời gian: 6 tháng
      6: { /* ... */ },
      // Khoảng thời gian: 12 tháng
      12: { /* ... */ }
    }
  },
  
  // Sản phẩm: Máy phun sương (ID: 4)
  4: {
    // Khu vực: Miền Bắc
    "north": {
      // Khoảng thời gian: 3 tháng
      3: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 85.0,
              salesVolume: 120,
              averageRating: 4.2,
              trend: "Tăng"
            },
            "Mưa nhẹ": {
              averagePerformance: 70.0,
              salesVolume: 80,
              averageRating: 3.8,
              trend: "Giảm"
            },
            "Nắng vừa": {
              averagePerformance: 92.0,
              salesVolume: 180,
              averageRating: 4.5,
              trend: "Tăng"
            },
            "Mưa vừa": {
              averagePerformance: 65.0,
              salesVolume: 60,
              averageRating: 3.6,
              trend: "Giảm"
            }
          },
          temperaturePerformance: {
            "15-20°C": 65.0,
            "20-25°C": 78.0,
            "25-30°C": 88.0,
            "30-35°C": 95.0,
            ">35°C": 98.0
          },
          humidityPerformance: {
            "<40%": 96.0,
            "40-60%": 85.0,
            "60-80%": 70.0,
            ">80%": 60.0
          },
          seasonalPerformance: {
            "Xuân": 78.0,
            "Hè": 95.0,
            "Thu": 80.0,
            "Đông": 65.0
          },
          optimalConditions: {
            weather: "Nắng vừa",
            temperature: ">35°C",
            humidity: "<40%",
            season: "Hè"
          }
        },
        optimizationTips: [
          "Sử dụng máy phun sương hiệu quả nhất trong điều kiện nắng vừa và nhiệt độ cao",
          "Làm nổi bật lợi ích làm mát và tăng độ ẩm cho không gian trong thời tiết nắng nóng",
          "Khuyến khích sử dụng máy phun sương để tạo môi trường lý tưởng cho cây trồng mùa hè",
          "Điều chỉnh áp lực phun sương dựa theo độ ẩm môi trường - áp lực cao khi độ ẩm thấp",
          "Kết hợp máy phun sương với hệ thống quạt thông gió để tối ưu hiệu quả làm mát",
          "Giới thiệu tính năng hẹn giờ để tự động phun sương vào thời điểm nhiệt độ cao nhất trong ngày"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 6, 1).toISOString(),
              weather: "Nắng vừa",
              temperature: 33.0,
              humidity: 45,
              performance: 94.0
            },
            {
              date: new Date(2023, 6, 2).toISOString(),
              weather: "Nắng vừa",
              temperature: 34.0,
              humidity: 42,
              performance: 95.0
            },
            {
              date: new Date(2023, 6, 3).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 30.0,
              humidity: 50,
              performance: 86.0
            },
            {
              date: new Date(2023, 6, 4).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 28.0,
              humidity: 65,
              performance: 72.0
            },
            {
              date: new Date(2023, 6, 5).toISOString(),
              weather: "Nắng vừa",
              temperature: 35.0,
              humidity: 38,
              performance: 97.0
            },
            {
              date: new Date(2023, 6, 6).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 31.0,
              humidity: 48,
              performance: 88.0
            },
            {
              date: new Date(2023, 6, 7).toISOString(),
              weather: "Mưa vừa",
              temperature: 27.0,
              humidity: 70,
              performance: 65.0
            }
          ],
          averagePerformance: 85.3,
          trend: "Tăng",
          usageRecommendations: [
            "Tăng cường quảng cáo và khuyến mãi vào ngày 5/7 khi hiệu suất đạt đỉnh (97%)",
            "Chuẩn bị nguồn cung dồi dào trong tháng 7 để đáp ứng nhu cầu tăng cao khi nắng nóng",
            "Giới thiệu gói bảo trì đặc biệt dành cho mùa hè để tối ưu hóa hiệu quả sử dụng",
            "Cung cấp hướng dẫn sử dụng máy phun sương phù hợp với từng điều kiện thời tiết"
          ]
        }
      },
      // Khoảng thời gian: 6 tháng
      6: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 83.0,
              salesVolume: 320,
              averageRating: 4.1,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 68.0,
              salesVolume: 220,
              averageRating: 3.7,
              trend: "Giảm"
            },
            "Nắng vừa": {
              averagePerformance: 90.0,
              salesVolume: 450,
              averageRating: 4.4,
              trend: "Tăng"
            },
            "Mưa vừa": {
              averagePerformance: 62.0,
              salesVolume: 180,
              averageRating: 3.5,
              trend: "Giảm"
            }
          },
          temperaturePerformance: {
            "15-20°C": 60.0,
            "20-25°C": 75.0,
            "25-30°C": 85.0,
            "30-35°C": 92.0,
            ">35°C": 95.0
          },
          humidityPerformance: {
            "<40%": 94.0,
            "40-60%": 82.0,
            "60-80%": 68.0,
            ">80%": 58.0
          },
          seasonalPerformance: {
            "Xuân": 75.0,
            "Hè": 93.0,
            "Thu": 78.0,
            "Đông": 62.0
          },
          optimalConditions: {
            weather: "Nắng vừa",
            temperature: ">35°C",
            humidity: "<40%",
            season: "Hè"
          }
        },
        optimizationTips: [
          "Xây dựng chiến dịch marketing theo mùa, tập trung cao điểm vào mùa hè",
          "Phát triển các gói sản phẩm kết hợp máy phun sương với hệ thống tưới nhỏ giọt",
          "Giảm giá cho các loại máy phun sương công suất lớn trong thời tiết nắng nóng",
          "Đẩy mạnh tính năng tiết kiệm điện và nước của máy phun sương trong các chiến dịch quảng cáo",
          "Cung cấp dịch vụ lắp đặt miễn phí cho các đơn hàng trong mùa cao điểm",
          "Phát triển chương trình khách hàng thân thiết để tăng tỷ lệ mua lại"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 6, 1).toISOString(),
              weather: "Nắng vừa",
              temperature: 33.0,
              humidity: 45,
              performance: 92.0
            },
            {
              date: new Date(2023, 6, 2).toISOString(),
              weather: "Nắng vừa",
              temperature: 34.0,
              humidity: 42,
              performance: 93.0
            },
            {
              date: new Date(2023, 6, 3).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 30.0,
              humidity: 50,
              performance: 84.0
            },
            {
              date: new Date(2023, 6, 4).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 28.0,
              humidity: 65,
              performance: 70.0
            },
            {
              date: new Date(2023, 6, 5).toISOString(),
              weather: "Nắng vừa",
              temperature: 35.0,
              humidity: 38,
              performance: 95.0
            },
            {
              date: new Date(2023, 6, 6).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 31.0,
              humidity: 48,
              performance: 85.0
            },
            {
              date: new Date(2023, 6, 7).toISOString(),
              weather: "Mưa vừa",
              temperature: 27.0,
              humidity: 70,
              performance: 62.0
            }
          ],
          averagePerformance: 83.0,
          trend: "Ổn định",
          usageRecommendations: [
            "Tập trung nguồn lực quảng cáo vào ngày 2/7 và 5/7 khi hiệu suất cao nhất",
            "Chuẩn bị kế hoạch dự phòng cho ngày mưa khi hiệu suất thấp",
            "Phát triển chiến lược định giá theo thời tiết để tối ưu doanh thu",
            "Mở rộng kênh phân phối online để tiếp cận khách hàng trong mùa cao điểm"
          ]
        }
      },
      // Khoảng thời gian: 12 tháng
      12: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 80.0,
              salesVolume: 680,
              averageRating: 4.0,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 65.0,
              salesVolume: 420,
              averageRating: 3.6,
              trend: "Giảm"
            },
            "Nắng vừa": {
              averagePerformance: 88.0,
              salesVolume: 950,
              averageRating: 4.3,
              trend: "Tăng"
            },
            "Mưa vừa": {
              averagePerformance: 60.0,
              salesVolume: 380,
              averageRating: 3.4,
              trend: "Giảm"
            }
          },
          temperaturePerformance: {
            "15-20°C": 58.0,
            "20-25°C": 72.0,
            "25-30°C": 82.0,
            "30-35°C": 90.0,
            ">35°C": 92.0
          },
          humidityPerformance: {
            "<40%": 92.0,
            "40-60%": 80.0,
            "60-80%": 65.0,
            ">80%": 55.0
          },
          seasonalPerformance: {
            "Xuân": 72.0,
            "Hè": 90.0,
            "Thu": 75.0,
            "Đông": 60.0
          },
          optimalConditions: {
            weather: "Nắng vừa",
            temperature: ">35°C",
            humidity: "<40%",
            season: "Hè"
          }
        },
        optimizationTips: [
          "Điều chỉnh kế hoạch sản xuất theo mùa vụ, tập trung vào quý 2 và quý 3",
          "Phát triển phiên bản máy phun sương đa năng cho cả bốn mùa",
          "Đa dạng hóa sản phẩm với các tính năng chuyên biệt cho từng điều kiện thời tiết",
          "Thiết lập hệ thống dự báo nhu cầu dựa trên dữ liệu thời tiết dài hạn",
          "Phát triển tính năng tiết kiệm năng lượng cho sản phẩm sử dụng trong mùa đông",
          "Xây dựng hệ thống logistics đáp ứng nhanh nhu cầu thay đổi theo mùa vụ"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 6, 1).toISOString(),
              weather: "Nắng vừa",
              temperature: 33.0,
              humidity: 45,
              performance: 89.0
            },
            {
              date: new Date(2023, 6, 2).toISOString(),
              weather: "Nắng vừa",
              temperature: 34.0,
              humidity: 42,
              performance: 90.0
            },
            {
              date: new Date(2023, 6, 3).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 30.0,
              humidity: 50,
              performance: 82.0
            },
            {
              date: new Date(2023, 6, 4).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 28.0,
              humidity: 65,
              performance: 68.0
            },
            {
              date: new Date(2023, 6, 5).toISOString(),
              weather: "Nắng vừa",
              temperature: 35.0,
              humidity: 38,
              performance: 92.0
            },
            {
              date: new Date(2023, 6, 6).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 31.0,
              humidity: 48,
              performance: 83.0
            },
            {
              date: new Date(2023, 6, 7).toISOString(),
              weather: "Mưa vừa",
              temperature: 27.0,
              humidity: 70,
              performance: 60.0
            }
          ],
          averagePerformance: 80.6,
          trend: "Ổn định",
          usageRecommendations: [
            "Phát triển chiến lược định vị sản phẩm theo mùa vụ để duy trì doanh số quanh năm",
            "Cung cấp dịch vụ bảo trì theo mùa để duy trì hiệu suất sản phẩm ở mức tối ưu",
            "Xây dựng chương trình khách hàng thân thiết có ưu đãi theo mùa vụ",
            "Đầu tư nghiên cứu phát triển sản phẩm phù hợp với điều kiện thời tiết Việt Nam"
          ]
        }
      }
    },
    // Khu vực: Miền Trung
    "central": {
      // Khoảng thời gian: 3 tháng
      3: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 80.0,
              salesVolume: 110,
              averageRating: 4.0,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 65.0,
              salesVolume: 70,
              averageRating: 3.5,
              trend: "Giảm"
            },
            "Nắng vừa": {
              averagePerformance: 95.0,
              salesVolume: 200,
              averageRating: 4.7,
              trend: "Tăng"
            },
            "Mưa vừa": {
              averagePerformance: 60.0,
              salesVolume: 55,
              averageRating: 3.4,
              trend: "Giảm"
            }
          },
          temperaturePerformance: {
            "15-20°C": 62.0,
            "20-25°C": 75.0,
            "25-30°C": 85.0,
            "30-35°C": 95.0,
            ">35°C": 98.0
          },
          humidityPerformance: {
            "<40%": 97.0,
            "40-60%": 85.0,
            "60-80%": 70.0,
            ">80%": 58.0
          },
          seasonalPerformance: {
            "Xuân": 78.0,
            "Hè": 97.0,
            "Thu": 75.0,
            "Đông": 60.0
          },
          optimalConditions: {
            weather: "Nắng vừa",
            temperature: ">35°C",
            humidity: "<40%",
            season: "Hè"
          }
        },
        optimizationTips: [
          "Tại miền Trung, nên trồng táo vào đầu mùa xuân trước khi bắt đầu mùa nắng nóng",
          "Chọn vị trí trồng có che chắn để giảm tác động của gió mùa và nắng gắt",
          "Sử dụng giống táo chịu nhiệt phù hợp với khí hậu miền Trung như táo Đài Loan, táo Fuji",
          "Áp dụng kỹ thuật trồng trên đồi hoặc sườn núi để thoát nước tốt trong mùa mưa",
          "Bón phân giàu kali để tăng khả năng chống chịu hạn hán"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 2, 1).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 20.0,
              humidity: 65,
              performance: 83.0
            },
            {
              date: new Date(2023, 2, 2).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 21.0,
              humidity: 63,
              performance: 81.0
            },
            {
              date: new Date(2023, 2, 3).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 19.0,
              humidity: 72,
              performance: 79.0
            },
            {
              date: new Date(2023, 2, 4).toISOString(),
              weather: "Mưa vừa",
              temperature: 18.0,
              humidity: 80,
              performance: 73.0
            },
            {
              date: new Date(2023, 2, 5).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 20.5,
              humidity: 62,
              performance: 82.0
            },
            {
              date: new Date(2023, 2, 6).toISOString(),
              weather: "Nắng vừa",
              temperature: 25.0,
              humidity: 55,
              performance: 66.0
            },
            {
              date: new Date(2023, 2, 7).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 22.0,
              humidity: 60,
              performance: 80.0
            }
          ],
          averagePerformance: 77.7,
          trend: "Ổn định",
          usageRecommendations: [
            "Tập trung trồng cây vào 3 ngày đầu tháng khi điều kiện thời tiết tương đối thuận lợi",
            "Lắp đặt hệ thống tưới nhỏ giọt để duy trì độ ẩm đất ổn định",
            "Sử dụng lưới che nắng trong những ngày nắng vừa đến nắng gắt",
            "Áp dụng kỹ thuật tạo hình cây thấp để dễ chăm sóc và bảo vệ trong mùa bão"
          ]
        }
      },
      // Khoảng thời gian: 6 tháng
      6: { /* ... */ },
      // Khoảng thời gian: 12 tháng
      12: { /* ... */ }
    },
    // Khu vực: Miền Nam
    "south": {
      // Khoảng thời gian: 3 tháng
      3: { /* ... */ },
      // Khoảng thời gian: 6 tháng
      6: { /* ... */ },
      // Khoảng thời gian: 12 tháng
      12: { /* ... */ }
    },
    // Khu vực: Tây Nguyên
    "highlands": {
      // Khoảng thời gian: 3 tháng
      3: { /* ... */ },
      // Khoảng thời gian: 6 tháng
      6: { /* ... */ },
      // Khoảng thời gian: 12 tháng
      12: { /* ... */ }
    }
  },
  
  // Sản phẩm: Cây giống táo (ID: 5)
  5: {
    // Khu vực: Miền Bắc
    "north": {
      // Khoảng thời gian: 3 tháng
      3: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 92.0,
              salesVolume: 180,
              averageRating: 4.6,
              trend: "Tăng"
            },
            "Mưa nhẹ": {
              averagePerformance: 85.0,
              salesVolume: 140,
              averageRating: 4.3,
              trend: "Ổn định"
            },
            "Nắng vừa": {
              averagePerformance: 75.0,
              salesVolume: 110,
              averageRating: 3.9,
              trend: "Giảm"
            },
            "Mưa vừa": {
              averagePerformance: 78.0,
              salesVolume: 120,
              averageRating: 4.0,
              trend: "Ổn định"
            }
          },
          temperaturePerformance: {
            "15-20°C": 95.0,
            "20-25°C": 90.0,
            "25-30°C": 78.0,
            "30-35°C": 65.0,
            ">35°C": 50.0
          },
          humidityPerformance: {
            "<40%": 65.0,
            "40-60%": 88.0,
            "60-80%": 92.0,
            ">80%": 80.0
          },
          seasonalPerformance: {
            "Xuân": 95.0,
            "Hè": 75.0,
            "Thu": 85.0,
            "Đông": 65.0
          },
          optimalConditions: {
            weather: "Nắng nhẹ",
            temperature: "15-20°C",
            humidity: "60-80%",
            season: "Xuân"
          }
        },
        optimizationTips: [
          "Trồng cây giống táo vào đầu mùa xuân khi thời tiết nắng nhẹ và nhiệt độ 15-20°C",
          "Đảm bảo độ ẩm đất ở mức 60-80% để cây phát triển tốt nhất",
          "Tránh trồng cây trong thời tiết nắng nóng trên 30°C do khả năng sống sót giảm mạnh",
          "Che chắn cây con khỏi ánh nắng trực tiếp trong 2 tuần đầu sau khi trồng",
          "Bón phân NPK tỷ lệ cân đối vào đất trước khi trồng để tăng tỷ lệ sống",
          "Xử lý đất bằng thuốc diệt nấm trước khi trồng để hạn chế bệnh thối rễ"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 2, 1).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 18.0,
              humidity: 70,
              performance: 94.0
            },
            {
              date: new Date(2023, 2, 2).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 19.0,
              humidity: 68,
              performance: 93.0
            },
            {
              date: new Date(2023, 2, 3).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 17.0,
              humidity: 75,
              performance: 86.0
            },
            {
              date: new Date(2023, 2, 4).toISOString(),
              weather: "Mưa vừa",
              temperature: 16.0,
              humidity: 82,
              performance: 79.0
            },
            {
              date: new Date(2023, 2, 5).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 18.5,
              humidity: 65,
              performance: 92.0
            },
            {
              date: new Date(2023, 2, 6).toISOString(),
              weather: "Nắng vừa",
              temperature: 22.0,
              humidity: 60,
              performance: 76.0
            },
            {
              date: new Date(2023, 2, 7).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 19.0,
              humidity: 68,
              performance: 92.5
            }
          ],
          averagePerformance: 87.5,
          trend: "Tăng",
          usageRecommendations: [
            "Tập trung trồng cây vào tuần đầu tháng 3 khi điều kiện thời tiết lý tưởng nhất",
            "Đảm bảo tưới nước đều đặn trong những ngày nắng vừa (ngày 6/3)",
            "Che phủ gốc cây để giữ ẩm và tránh nhiệt độ tăng cao vào giữa ngày",
            "Áp dụng phương pháp trồng theo hàng hướng Đông-Tây để tối ưu ánh sáng"
          ]
        }
      },
      // Khoảng thời gian: 6 tháng
      6: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 90.0,
              salesVolume: 480,
              averageRating: 4.5,
              trend: "Tăng"
            },
            "Mưa nhẹ": {
              averagePerformance: 84.0,
              salesVolume: 420,
              averageRating: 4.2,
              trend: "Ổn định"
            },
            "Nắng vừa": {
              averagePerformance: 72.0,
              salesVolume: 300,
              averageRating: 3.8,
              trend: "Giảm"
            },
            "Mưa vừa": {
              averagePerformance: 76.0,
              salesVolume: 350,
              averageRating: 3.9,
              trend: "Ổn định"
            }
          },
          temperaturePerformance: {
            "15-20°C": 92.0,
            "20-25°C": 88.0,
            "25-30°C": 75.0,
            "30-35°C": 62.0,
            ">35°C": 48.0
          },
          humidityPerformance: {
            "<40%": 62.0,
            "40-60%": 85.0,
            "60-80%": 90.0,
            ">80%": 78.0
          },
          seasonalPerformance: {
            "Xuân": 93.0,
            "Hè": 70.0,
            "Thu": 83.0,
            "Đông": 62.0
          },
          optimalConditions: {
            weather: "Nắng nhẹ",
            temperature: "15-20°C",
            humidity: "60-80%",
            season: "Xuân"
          }
        },
        optimizationTips: [
          "Tập trung bán cây giống táo vào đầu mùa xuân (tháng 2-3) để đạt hiệu quả cao nhất",
          "Phát triển gói dịch vụ chăm sóc trọn gói cho khách hàng trong 6 tháng đầu",
          "Cung cấp phân bón và hướng dẫn chăm sóc theo từng giai đoạn phát triển của cây",
          "Khuyến cáo người trồng nên tránh các vùng đất ngập nước hoặc có độ ẩm cao quá 80%",
          "Phát triển các giống táo lai phù hợp với điều kiện khí hậu từng vùng miền",
          "Tổ chức các khóa đào tạo trồng và chăm sóc cây táo cho người mới bắt đầu"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 2, 1).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 18.0,
              humidity: 70,
              performance: 92.0
            },
            {
              date: new Date(2023, 2, 2).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 19.0,
              humidity: 68,
              performance: 91.0
            },
            {
              date: new Date(2023, 2, 3).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 17.0,
              humidity: 75,
              performance: 85.0
            },
            {
              date: new Date(2023, 2, 4).toISOString(),
              weather: "Mưa vừa",
              temperature: 16.0,
              humidity: 82,
              performance: 78.0
            },
            {
              date: new Date(2023, 2, 5).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 18.5,
              humidity: 65,
              performance: 90.0
            },
            {
              date: new Date(2023, 2, 6).toISOString(),
              weather: "Nắng vừa",
              temperature: 22.0,
              humidity: 60,
              performance: 74.0
            },
            {
              date: new Date(2023, 2, 7).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 19.0,
              humidity: 68,
              performance: 90.0
            }
          ],
          averagePerformance: 85.7,
          trend: "Ổn định",
          usageRecommendations: [
            "Xây dựng kế hoạch trồng dài hạn với lịch chăm sóc chi tiết cho 6 tháng đầu tiên",
            "Đảm bảo cung cấp đủ nước trong mùa khô và thoát nước tốt trong mùa mưa",
            "Áp dụng phân bón theo đợt với tỷ lệ N-P-K thay đổi theo giai đoạn phát triển",
            "Theo dõi và phòng trị sâu bệnh ngay từ giai đoạn đầu để đảm bảo tỷ lệ sống cao"
          ]
        }
      },
      // Khoảng thời gian: 12 tháng
      12: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 88.0,
              salesVolume: 980,
              averageRating: 4.4,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 82.0,
              salesVolume: 850,
              averageRating: 4.1,
              trend: "Ổn định"
            },
            "Nắng vừa": {
              averagePerformance: 70.0,
              salesVolume: 650,
              averageRating: 3.7,
              trend: "Giảm"
            },
            "Mưa vừa": {
              averagePerformance: 74.0,
              salesVolume: 720,
              averageRating: 3.8,
              trend: "Ổn định"
            }
          },
          temperaturePerformance: {
            "15-20°C": 90.0,
            "20-25°C": 85.0,
            "25-30°C": 72.0,
            "30-35°C": 60.0,
            ">35°C": 45.0
          },
          humidityPerformance: {
            "<40%": 60.0,
            "40-60%": 82.0,
            "60-80%": 88.0,
            ">80%": 75.0
          },
          seasonalPerformance: {
            "Xuân": 92.0,
            "Hè": 68.0,
            "Thu": 75.0,
            "Đông": 60.0
          },
          optimalConditions: {
            weather: "Nắng nhẹ",
            temperature: "15-20°C",
            humidity: "60-80%",
            season: "Xuân"
          }
        },
        optimizationTips: [
          "Xây dựng chiến lược kinh doanh theo mùa vụ, tập trung nguồn lực vào mùa xuân",
          "Phát triển các giống táo có khả năng chống chịu với nhiều điều kiện thời tiết khác nhau",
          "Cung cấp dịch vụ tư vấn thiết kế vườn táo theo đặc thù thổ nhưỡng từng vùng",
          "Tổ chức các tour tham quan vườn táo mẫu để thu hút khách hàng tiềm năng",
          "Hợp tác với các trường đại học nông nghiệp để nghiên cứu cải thiện giống",
          "Xây dựng hệ thống theo dõi và cảnh báo thời tiết cho các vườn táo"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 2, 1).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 18.0,
              humidity: 70,
              performance: 89.0
            },
            {
              date: new Date(2023, 2, 2).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 19.0,
              humidity: 68,
              performance: 88.0
            },
            {
              date: new Date(2023, 2, 3).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 17.0,
              humidity: 75,
              performance: 83.0
            },
            {
              date: new Date(2023, 2, 4).toISOString(),
              weather: "Mưa vừa",
              temperature: 16.0,
              humidity: 82,
              performance: 75.0
            },
            {
              date: new Date(2023, 2, 5).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 18.5,
              humidity: 65,
              performance: 87.0
            },
            {
              date: new Date(2023, 2, 6).toISOString(),
              weather: "Nắng vừa",
              temperature: 22.0,
              humidity: 60,
              performance: 71.0
            },
            {
              date: new Date(2023, 2, 7).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 19.0,
              humidity: 68,
              performance: 88.0
            }
          ],
          averagePerformance: 83.0,
          trend: "Ổn định",
          usageRecommendations: [
            "Lập kế hoạch trồng và chăm sóc táo cho cả năm với lịch chăm sóc theo mùa vụ",
            "Áp dụng các biện pháp bảo vệ cây trong mùa đông và mùa nắng nóng",
            "Chuẩn bị hệ thống tưới tiêu thông minh để đối phó với biến đổi thời tiết",
            "Phát triển kỹ thuật ghép cành để tăng khả năng sinh trưởng của cây táo"
          ]
        }
      }
    },
    // Khu vực: Miền Trung
    "central": {
      // Khoảng thời gian: 3 tháng
      3: {
        performanceData: {
          weatherPerformanceDetailed: {
            "Nắng nhẹ": {
              averagePerformance: 82.0,
              salesVolume: 120,
              averageRating: 4.1,
              trend: "Ổn định"
            },
            "Mưa nhẹ": {
              averagePerformance: 78.0,
              salesVolume: 100,
              averageRating: 3.9,
              trend: "Ổn định"
            },
            "Nắng vừa": {
              averagePerformance: 65.0,
              salesVolume: 70,
              averageRating: 3.4,
              trend: "Giảm"
            },
            "Mưa vừa": {
              averagePerformance: 72.0,
              salesVolume: 85,
              averageRating: 3.7,
              trend: "Ổn định"
            }
          },
          temperaturePerformance: {
            "15-20°C": 85.0,
            "20-25°C": 80.0,
            "25-30°C": 70.0,
            "30-35°C": 58.0,
            ">35°C": 42.0
          },
          humidityPerformance: {
            "<40%": 55.0,
            "40-60%": 75.0,
            "60-80%": 82.0,
            ">80%": 70.0
          },
          seasonalPerformance: {
            "Xuân": 83.0,
            "Hè": 60.0,
            "Thu": 75.0,
            "Đông": 70.0
          },
          optimalConditions: {
            weather: "Nắng nhẹ",
            temperature: "15-20°C",
            humidity: "60-80%",
            season: "Xuân"
          }
        },
        optimizationTips: [
          "Tại miền Trung, nên trồng táo vào đầu mùa xuân trước khi bắt đầu mùa nắng nóng",
          "Chọn vị trí trồng có che chắn để giảm tác động của gió mùa và nắng gắt",
          "Sử dụng giống táo chịu nhiệt phù hợp với khí hậu miền Trung như táo Đài Loan, táo Fuji",
          "Áp dụng kỹ thuật trồng trên đồi hoặc sườn núi để thoát nước tốt trong mùa mưa",
          "Bón phân giàu kali để tăng khả năng chống chịu hạn hán"
        ],
        futurePredictions: {
          performancePredictions: [
            {
              date: new Date(2023, 2, 1).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 20.0,
              humidity: 65,
              performance: 83.0
            },
            {
              date: new Date(2023, 2, 2).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 21.0,
              humidity: 63,
              performance: 81.0
            },
            {
              date: new Date(2023, 2, 3).toISOString(),
              weather: "Mưa nhẹ",
              temperature: 19.0,
              humidity: 72,
              performance: 79.0
            },
            {
              date: new Date(2023, 2, 4).toISOString(),
              weather: "Mưa vừa",
              temperature: 18.0,
              humidity: 80,
              performance: 73.0
            },
            {
              date: new Date(2023, 2, 5).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 20.5,
              humidity: 62,
              performance: 82.0
            },
            {
              date: new Date(2023, 2, 6).toISOString(),
              weather: "Nắng vừa",
              temperature: 25.0,
              humidity: 55,
              performance: 66.0
            },
            {
              date: new Date(2023, 2, 7).toISOString(),
              weather: "Nắng nhẹ",
              temperature: 22.0,
              humidity: 60,
              performance: 80.0
            }
          ],
          averagePerformance: 77.7,
          trend: "Ổn định",
          usageRecommendations: [
            "Tập trung trồng cây vào 3 ngày đầu tháng khi điều kiện thời tiết tương đối thuận lợi",
            "Lắp đặt hệ thống tưới nhỏ giọt để duy trì độ ẩm đất ổn định",
            "Sử dụng lưới che nắng trong những ngày nắng vừa đến nắng gắt",
            "Áp dụng kỹ thuật tạo hình cây thấp để dễ chăm sóc và bảo vệ trong mùa bão"
          ]
        }
      },
      // Khoảng thời gian: 6 tháng
      6: { /* ... */ },
      // Khoảng thời gian: 12 tháng
      12: { /* ... */ }
    },
    // Khu vực: Miền Nam
    "south": {
      // Khoảng thời gian: 3 tháng
      3: { /* ... */ },
      // Khoảng thời gian: 6 tháng
      6: { /* ... */ },
      // Khoảng thời gian: 12 tháng
      12: { /* ... */ }
    },
    // Khu vực: Tây Nguyên
    "highlands": {
      // Khoảng thời gian: 3 tháng
      3: { /* ... */ },
      // Khoảng thời gian: 6 tháng
      6: { /* ... */ },
      // Khoảng thời gian: 12 tháng
      12: { /* ... */ }
    }
  }
};

export default weatherProductPerformanceData; 