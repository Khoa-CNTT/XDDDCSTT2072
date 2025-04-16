import React from "react"; // eslint-disable-line no-unused-vars
import Header from "../components/Header";
import TeamMembers from "../components/TeamMembers";

const AboutUs = () => {
  return (
    <div>
      <Header />
      <section className="relative bg-cover bg-center h-[500px] text-white" style={{ backgroundImage: 'url("/path-to-your-hero-image.jpg")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Về Chúng Tôi</h1>
          <p className="text-xl max-w-2xl">
            Chúng tôi là một nhóm đam mê công nghệ, mong muốn xây dựng các giải pháp sáng tạo giúp nông dân và cộng đồng phát triển bền vững.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 bg-white text-gray-800 text-center">
        <h2 className="text-3xl font-semibold mb-6">Sứ Mệnh Của Chúng Tôi</h2>
        <p className="max-w-3xl mx-auto text-lg leading-relaxed">
          Kết nối nông dân với công nghệ, tối ưu hóa sản lượng cây trồng, và tạo ra một nền tảng nông nghiệp số toàn diện.
        </p>
      </section>
      <TeamMembers />
    </div>
  );
};

export default AboutUs;
