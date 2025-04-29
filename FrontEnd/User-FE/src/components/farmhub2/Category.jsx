import { queryKeys } from "@/constant/queryKeys";
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
  const { data: categories, isLoading } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => getAllCategories(axiosPrivate),
  });


  // configure slider
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PreArrow />,
  };

  // handle click category
  const handleCategoryClick = (categoryId) => {
    navigate(`category/${categoryId}`);
  };

  return (
    <div className="flex flex-col gap-2 py-4 my-4 px-5 bg-[#E4EFE7] rounded-2xl w-full max-h-56">
      <h1 className="font-bold text-2xl ml-2">Danh mục</h1>
      {isLoading ? (
        <Loading />
      ) : (
        <Slider {...settings}>
          {categories.data.map((category, index) => (
            <div key={index} className="w-24">
              <div className="flex flex-col items-center cursor-pointer">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden "
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <img
                    className="w-full h-full object-cover"
                    src={category.imageUrl}
                    alt={category.description}
                  />
                </div>
                <h1 className="text-center text-sm mt-2">{category.name}</h1>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default Category;
