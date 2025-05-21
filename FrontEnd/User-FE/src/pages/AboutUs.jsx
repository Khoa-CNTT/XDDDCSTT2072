import React from "react"; // eslint-disable-line no-unused-vars

import TeamMembers from "../components/TeamMembers";
import Header from "../layout/Header";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  {
    image: "/banner1.jpg",
    title: "Giải pháp nông nghiệp hiện đại",
    description:
      "Sản phẩm công nghệ nông nghiệp tiên tiến giúp tăng năng suất canh tác",
  },
  {
    image: "/banner2.jpg",
    title: "Ruộng bậc thang miền núi",
    description:
      "Vẻ đẹp của nông nghiệp truyền thống Việt Nam qua các thửa ruộng bậc thang",
  },
  {
    image: "/banner3.jpg",
    title: "Phân bón hữu cơ",
    description:
      "Phân bón tự nhiên, thân thiện với môi trường, tốt cho cây trồng và đất",
  },
  {
    image: "/banner5.jpg",
    title: "Rau hữu cơ tươi sạch",
    description:
      "Rau tươi từ nông trại đến bàn ăn của bạn, đảm bảo an toàn và chất lượng",
  },
];

const AboutUs = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,

    adaptiveHeight: true,
  };

  return (
    <div>
      <Header />
      <section
        className="relative bg-cover bg-center h-[500px] text-white"
        style={{ backgroundImage: 'url("/path-to-your-hero-image.jpg")' }}
      >
        {/* <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Về Chúng Tôi</h1>
          <p className="text-xl max-w-2xl">
            Chúng tôi là một nhóm đam mê công nghệ, mong muốn xây dựng các giải pháp sáng tạo giúp nông dân và cộng đồng phát triển bền vững.
          </p>
        </div> */}
        <div className="w-full mb-8 mt-16">
          <div className="banner-slider-container">
            <Slider {...settings}>
              {slides.map((slide, index) => (
                <div key={index}>
                  <div className="relative banner-slide">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-[400px] object-cover"
                      onError={(e) => {
                        console.error("Error loading image:", e.target.src);
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/1200x400?text=Banner+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-opacity-40 flex flex-col justify-center px-16">
                      <h2 className="text-white text-4xl font-bold mb-4">
                        {slide.title}
                      </h2>
                      <p className="text-white text-xl">{slide.description}</p>
                      <button className="bg-green-500 text-white py-2 px-6 rounded-lg mt-6 hover:bg-green-600 transition-colors w-fit">
                        Khám phá ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white text-gray-800 text-center">
        <h2 className="text-3xl font-semibold mb-6">Sứ Mệnh Của Chúng Tôi</h2>
        <p className="max-w-3xl mx-auto text-lg leading-relaxed">
          Kết nối nông dân với công nghệ, tối ưu hóa sản lượng cây trồng, và tạo
          ra một nền tảng nông nghiệp số toàn diện.
        </p>
      </section>
      <TeamMembers />
    </div>
  );
};

export default AboutUs;
