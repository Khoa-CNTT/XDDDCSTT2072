import { useState, useEffect } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { getAllCategories } from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import Loading from "../shared/Loading";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NextArrow from "../shared/NextArrow";
import PreArrow from "../shared/PreArrow";
import { useNavigate } from "react-router";

const Category = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  // Lấy dữ liệu danh mục từ API
  const { data: categoriesResponse, isPending } = useQuery({
    queryKey: ["categoryList"],
    queryFn: () => getAllCategories(axiosPrivate),
  });
  
  // Truy xuất mảng danh mục từ response
  const categories = categoriesResponse?.data || [];
  
  // State quản lý số lượng slides hiển thị tùy theo kích thước màn hình
  const [slidesToShow, setSlidesToShow] = useState(7);

  // Điều chỉnh số lượng slides hiển thị dựa trên kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSlidesToShow(7); // 7 items trên màn hình lớn
      } else if (window.innerWidth >= 768) {
        setSlidesToShow(5); // 5 items trên màn hình trung bình
      } else if (window.innerWidth >= 480) {
        setSlidesToShow(3); // 3 items trên màn hình nhỏ
      } else {
        setSlidesToShow(2); // 2 items trên màn hình rất nhỏ
      }
    };

    // Gắn event listener và khởi tạo ban đầu
    window.addEventListener("resize", handleResize);
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Cấu hình slider
  const settings = {
    dots: false,
    infinite: categories.length > slidesToShow,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PreArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      }
    ]
  };

  // Xử lý sự kiện click vào danh mục
  const handleCategoryClick = (categoryId) => {
    navigate(`category/${categoryId}`);
  };

  return (
    <div className="flex flex-col gap-2 py-4 my-4 px-5 bg-[#E4EFE7] rounded-2xl w-full max-h-56">
      <h1 className="font-bold text-2xl ml-2">Danh mục</h1>
      
      {/* Hiển thị loading khi đang tải dữ liệu */}
      {isPending ? (
        <div className="flex justify-center items-center py-4">
          <Loading />
        </div>
      ) : categories.length === 0 ? (
        // Hiển thị thông báo khi không có danh mục
        <div className="text-center py-4 text-gray-500">
          Không có danh mục nào
        </div>
      ) : (
        // Hiển thị slider danh mục
        <Slider {...settings}>
          {categories.map((category, index) => (
            <div key={index} className="px-2">
              <div className="flex flex-col items-center cursor-pointer">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden bg-white border border-gray-200 flex items-center justify-center"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.imageUrl ? (
                    <img
                      className="w-full h-full object-cover"
                      src={category.imageUrl}
                      alt={category.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/80?text=Category";
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-xs text-center px-1">
                      No image
                    </div>
                  )}
                </div>
                <h1 className="text-center text-sm mt-2 line-clamp-2 h-10">
                  {category.name}
                </h1>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default Category;