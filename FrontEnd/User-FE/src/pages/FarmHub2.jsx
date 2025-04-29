import Footer from "@/layout/Footer";
import Header from "@/layout/Header";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import farmHub_bg_2 from "@/assets/images/farmHub_bg_2.jpg";
import farmHub_bg_3 from "@/assets/images/farmHub_bg_3.jpg";
import farmHub_bg_4 from "@/assets/images/farmHub_bg_4.jpg";
import { Outlet } from "react-router-dom";

const slides = [
  { image: farmHub_bg_2 },
  { image: farmHub_bg_3 },
  { image: farmHub_bg_4 },
];

const FarmHub2 = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <div className="flex-1">
        <Header />
        <div className="w-full mb-6 mt-15">
          <Slider {...settings}>
            {slides.map((slide, index) => (
              <div key={index}>
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-50 object-cover cursor-pointer"
                />
              </div>
            ))}
          </Slider>
        </div>
        <main className="px-10 mb-10">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default FarmHub2;
