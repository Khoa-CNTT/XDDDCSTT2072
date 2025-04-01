import React from "react";// eslint-disable-line no-unused-vars
import Header from "../components/Header";
import TeamMembers from "../components/TeamMembers";

const AboutUs = () => {
  return (
    <div className="">
      <Header />
      <div className="text-center bg-gradient-to-r from-blue-500 to-green-500 p-1">
        <h2 className="text-xl font-bold italic">About us</h2>
      </div>
      <TeamMembers />
    </div>
  );
};

export default AboutUs;
