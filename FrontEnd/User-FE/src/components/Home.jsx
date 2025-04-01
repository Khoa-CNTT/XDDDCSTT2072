import Header from "./Header";
import TextField from "@mui/material/TextField";
import instagramImages from "../assets/images/instagram.jpg";
import fbImages from "../assets/images/fb.jpg";
import twiterImages from "../assets/images/twiter.jpg";
import avatarImages from "../assets/images/avatar.jpg";





function Home() {
    return (
        <>
            <div>
                <Header />
                <div className="flex  p-4 px-16 rounded-lg gap-5"> {/* //px:padding ngang  */}
                    <div className="p-4 py-0 flex-[10]  ">   {/* Padding trái/phải: 16px,Padding trên/dưới: 0px*/}
                        <div className="border border-gray-500 rounded-xl">
                            <div className="flex items-center p-4">
                                <img
                                    src={avatarImages}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full object-cover mx-3"
                                />
                                <TextField
                                    fullWidth
                                    placeholder="What do you want to write?"
                                    variant="outlined"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "20px",
                                            backgroundColor: "#f3eeee",
                                            paddingLeft: "10px",
                                        },
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            border: "none",
                                        },
                                        "& .MuiInputBase-input": {
                                            fontStyle: "italic",
                                            fontSize: "14px",
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col justify-between gap-5 border border-gray-500 rounded-xl mt-3 p-3 ">
                            {[1, 2].map((key, index) => (
                                <div key={index} className="bg-gray rounded-xl shadow-md p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <img
                                            src={avatarImages}
                                            alt="avatar"
                                            className= "w-10 h-10 rounded-full"
                                        />
                                        <h2 className="font-bold">Title</h2>
                                    </div>
                                    <p className="text-gray-700">
                                        Về việc ăn uống trực tiếp khi đến khách tham quan, chị Thị Béo của chúng ta chưa bao giờ giấu về đồ ăn là thích, càng đặc biệt thích tham quan! Rực rỡ, thích quá, toàn là những món mình yêu thích.
                                    </p>
                                    <br />
                                    <div>Rou: Thích quá, toàn những món ăn mình yêu thích</div>
                                    <div className="bg-black text-white text-center py-16 my-4 rounded-lg">
                                        IMAGE
                                    </div>
                                    <div className="flex justify-center items-center gap-12  text-gray-500">
                                        <button>Like</button>
                                        <button>Comment</button>
                                        <button>Share</button>
                                    </div>
                                </div>
                            ))}

                        </div>



                    </div>

                    <div className="flex-3 p-2 bg-gray-200 border border-gray-500 rounded-lg">
                        <div className="relative bg-black rounded-lg h-100 text-white flex justify-center items-center">
                            <div>
                                CONTENT
                            </div>
                            <div className="absolute top-1 left-5">Weather</div>
                        </div>
                        <hr className="mt-3 mb-3"></hr>
                        <div className=" bg-purple-300 shadow-md rounded-lg text-center h-25">
                            <h3 className="font-bold mb-2">FOLLOW</h3>
                            <div className="flex justify-center gap-3">
                                <button className=" w-15 h-15 rounded-full">
                                    <img src={instagramImages} alt="" />
                                </button>
                                <button className=" w-15 h-15 rounded-full">
                                    <img src={fbImages} alt="" />
                                </button>
                                <button className=" w-15 h-15 rounded-full">
                                    <img src={twiterImages} alt="" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Home;
