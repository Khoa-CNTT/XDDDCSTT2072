import React, { useState } from "react";
import bgTeam from "../assets/images/team-desciption.jpg";
import imageMember from "../assets/images/image-member.jpg";
import bgMember1 from "../assets/images/bg-member1.jpg";
import bgMember2 from "../assets/images/bg-member2.jpg";
import bgMember3 from "../assets/images/bg-member3.jpg";
import bgMember4 from "../assets/images/bg-member4.jpg";
import bgMember5 from "../assets/images/bg-member5.jpg";
import bgInstructor from "../assets/images/bg-member5.jpg";
import imageInstructor from "../assets/images/bg-member3.jpg"; 
const instructor = {
  name: "Thầy Nguyễn Hữu Phúc",
  role: "Người Hướng Dẫn",
  imageBg: bgInstructor,
  imageMb: imageInstructor,
};

const members = [
  { name: "Lâm Quang Bách", role: "FrontEnd Developer", imageBg: bgMember1, imageMb: imageMember },
  { name: "Phan Quang Đức", role: "FrontEnd Developer", imageBg: bgMember2, imageMb: imageMember },
  { name: "Hoàng Văn Dũng", role: "Trưởng nhóm - Backend Developer", imageBg: bgMember3, imageMb: imageMember },
  { name: "Nguyễn Tấn Quang Thông", role: "Backend Developer", imageBg: bgMember4, imageMb: imageMember },
  { name: "Phạm Duy Truyền", role: "Backend Developer", imageBg: bgMember5, imageMb: imageMember },
];

const TeamMembers = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="bg-gray-100 py-16 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800">Người Hướng Dẫn</h2>
        <p className="text-gray-600 mt-2">
          Thầy là người đồng hành, định hướng và hỗ trợ chúng tôi trong suốt quá trình thực hiện dự án.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-20">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden transition-transform duration-300 transform hover:scale-105 relative group">
          <div
            className="h-44 bg-cover bg-center"
            style={{ backgroundImage: `url(${instructor.imageBg})` }}
          />
          <div className="flex flex-col items-center p-6">
            <img
              src={instructor.imageMb}
              alt={instructor.name}
              className="w-24 h-24 rounded-full border-4 border-white -mt-12 object-cover shadow-md"
            />
            <h3 className="text-2xl font-semibold mt-4 text-gray-800">{instructor.name}</h3>
            <p className="text-blue-600 text-sm font-medium mt-1">{instructor.role}</p>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-sm font-medium transition-opacity duration-300 rounded-xl opacity-0 group-hover:opacity-100 px-4 text-center">
            <p>Chúng tôi xin gửi lời cảm ơn sâu sắc đến Thầy vì sự tận tâm và hỗ trợ!</p>
          </div>
        </div>
      </div>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800">Gặp Gỡ Đội Ngũ</h2>
        <p className="text-gray-600 mt-2">
          Chúng tôi đều là những sinh viên năm cuối của Đại học Duy Tân, cùng nhau phát triển dự án này với đam mê và trách nhiệm.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {members.map((member, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-xl overflow-hidden transition-transform duration-300 transform hover:scale-105 relative group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="h-40 bg-cover bg-center"
              style={{ backgroundImage: `url(${member.imageBg})` }}
            />
            <div className="flex flex-col items-center p-6">
              <img
                src={member.imageMb}
                alt={member.name}
                className="w-24 h-24 rounded-full border-4 border-white -mt-12 object-cover shadow-md"
              />
              <h3 className="text-xl font-semibold mt-4 text-gray-800">{member.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{member.role}</p>
            </div>
            <div
              className={`absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white text-sm font-medium transition-opacity duration-300 rounded-xl px-4 text-center ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}
            >
              <p>Click để xem thêm thông tin chi tiết (tính năng sắp ra mắt)</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamMembers;
