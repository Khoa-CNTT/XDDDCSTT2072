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

  const { data: categories, isPending } = useQuery({
    queryKey: ["categoryList"],
    queryFn: () => getAllCategories(axiosPrivate),
  });
  console.log(categories);

  const [slidesToShow, setSlidesToShow] = useState(7);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSlidesToShow(7); // 7 items on large screens
      } else if (window.innerWidth >= 768) {
        setSlidesToShow(5); // 5 items on medium screens
      } else if (window.innerWidth >= 480) {
        setSlidesToShow(3); // 3 items on small screens
      } else {
        setSlidesToShow(2); // 2 items on extra small screens
      }
    };

    // Run on resize
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call to set the slides based on current screen size

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Slider configuration
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PreArrow />,
  };

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    navigate(`category/${categoryId}`);
  };

  return (
    <div className="flex flex-col gap-2 py-4 my-4 px-5 bg-[#E4EFE7] rounded-2xl w-full max-h-56">
      <h1 className="font-bold text-2xl ml-2">Danh mục</h1>
      {isPending ? (
        <Loading />
      ) : (
        <Slider {...settings}>
          {categories?.data?.map((category, index) => (
            <div key={index} className="w-24">
              <div className="flex flex-col items-center cursor-pointer">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden"
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
