import React from "react";
import bgDesciption from "../assets/images/team-desciption.jpg";
import teamMember from "../assets/images/team-member.jpg";
import bgMember1 from "../assets/images/bg-member1.jpg";
import bgMember2 from "../assets/images/bg-member2.jpg";
import bgMember3 from "../assets/images/bg-member3.jpg";
import bgMember4 from "../assets/images/bg-member4.jpg";
import bgMember5 from "../assets/images/bg-member5.jpg";
import imageMember from "../assets/images/image-member.jpg";

const members = [
  { name: "Lâm Quang Bách", imageBg: bgMember1, imageMb: imageMember },
  { name: "Phan Quang Đức", imageBg: bgMember2, imageMb: imageMember },
  { name: "Hoàng Văn Dũng", imageBg: bgMember3, imageMb: imageMember },
  {
    name: "Nguyễn Tấn Quang Thông",
    imageBg: bgMember4,
    imageMb: imageMember,
  },
  { name: "Phạm Duy Truyền", imageBg: bgMember5, imageMb: imageMember },
];

const TeamMembers = () => {
  return (
    <div>
      {/* Team description  */}
      <div className="relative w-full">
        <img
          className="object-cover h-[600px] w-full opacity-65"
          src={bgDesciption}
          alt=""
        />
        <p className="text-4xl font-black transform translate-x-[50%] absolute top-[20px] bg-gradient-to-r from-red-900 to-blue-950 text-transparent bg-clip-text">
          Team Desciption
        </p>
        <img
          className="absolute right-10 top-[50%] transform -translate-y-[50%] h-[550px] rounded-md shadow-md"
          src={teamMember}
          alt=""
        />
      </div>

      {/* display members */}
      <div>
        {members.map((member, index) => {
          const { name, imageBg, imageMb } = member;
          return (
            <div className="relative" key={index}>
              <p
                className={`absolute text-white text-3xl font-bold z-10 top-10 ${
                  index % 2 === 0 ? "left-10" : "right-10"
                } `}
              >
                {name}
              </p>
              <img
                src={imageMb}
                className={`h-[550px] absolute top-1/2 transform -translate-y-1/2 z-10 object-cover ${
                  index % 2 === 0 ? "right-10" : "left-10"
                } rounded-md shadow-md`}
                alt=""
              />
              <img
                src={imageBg}
                className="object-cover h-[600px] w-full opacity-80"
                alt=""
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamMembers;
