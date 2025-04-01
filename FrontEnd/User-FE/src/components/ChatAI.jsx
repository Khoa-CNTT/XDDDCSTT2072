import Header from "./Header";
import { Bars3Icon } from "@heroicons/react/24/solid";

function ChatAI() {
    return (
        <>
            <div className="border-4 border-white rounded-lg bg-white shadow-lg">
                <Header />
                <div className="flex">
                    <div className="flex-[2] bg-gray-300 p-4 flex justify-center items-start">
                        <Bars3Icon className="h-10 w-10 text-black" />
                    </div>

                    <div className="flex-[10] h-screen flex flex-col items-center justify-start pt-10">
                        <img
                            src="https://tse2.mm.bing.net/th?id=OIP.g_R7XFbO-iEWESUfk0AXlQHaEK&pid=Api&P=0&h=220"
                            alt="Avatar"
                            className="w-24 h-24 object-cover rounded-full mb-4"
                        />                      
                        <div className="text-center font-bold text-lg">   {/* text-lg:kích thước chữ */}
                            Xin chào.... Tôi là.... bạn có gì muốn hỏi tôi không?
                        </div>

                        <div className="mt-auto mb-10 w-1/2 bg-white shadow-lg rounded-xl flex items-center p-4 border border-gray-300">
                            <textarea
                                placeholder="Hỏi tôi điều gì đó..."
                                className="w-full h-12 resize-none outline-none bg-transparent p-2 text-gray-700" //bg-transparent(trong suốt),resize-none(Vô hiệu hóa khả năng thay đổi kích thước)
                            />
                            <button className="text-gray-500 text-xl px-3 hover:text-blue-500">
                                🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChatAI;
