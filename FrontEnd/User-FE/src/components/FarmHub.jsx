import Footer from "./Footer";
import Header from "./Header";




function FarmHub() {
    return (
        <>
            <div className="border-4 border-white rounded-lg bg-white shadow-lg">
                <Header />
                <div className="flex p-5 px-15 gap-10">
                    <div className="border border-gray-300 bg-white rounded-xl w-full px-5 py-3">
                        <div className="flex gap-15">
                            <div className="font-bold text-blue-600 cursor-pointer">All Products</div>
                            <div className="italic text-gray-700 cursor-pointer">List</div>
                            <div className="italic text-gray-700 cursor-pointer">List</div>
                            <div className="italic text-gray-700 cursor-pointer">List</div>
                            <div className="italic text-gray-700 cursor-pointer">List</div>
                        </div>
                    </div>
                </div>
                <div className="px-5">
                    <img 
                        className="w-full h-80 rounded-xl object-cover cursor-pointer" 
                        src="https://tse4.mm.bing.net/th?id=OIP.upcVyiUzz2n_UWkZdZmSFwHaEK&pid=Api&P=0&h=220" 
                        alt="" 
                    />
                </div>
                <div className="flex flex-col justify-center items-center px-5 text-center">
                    <h1 className="font-bold italic py-5 cursor-pointer">Enjoy Your Youth!</h1>
                    <p className="italic max-w-3xl">
                        Không chỉ đơn thuần là buôn bán nông sản, [Tên thương hiệu] còn là "cánh đồng xanh" của sự tận tâm –
                        nơi chọn lọc và mang đến những sản phẩm tươi ngon, an toàn từ thiên nhiên. Chúng mình luôn mong muốn tạo ra
                        một không gian kết nối giữa người nông dân và người tiêu dùng, giúp mọi người trải nghiệm sự trọn vẹn của hương vị
                        tự nhiên, dinh dưỡng và chất lượng.
                    </p>
                </div>

                <h1 className="font-bold italic px-5 py-5 cursor-pointer">Product Type</h1>
                <div className="flex flex-wrap justify-center px-5 py-5 gap-10">
                    {[...Array(12)].map((key, index) => (
                        <div 
                            key={index} 
                            className="w-45 h-60 bg-gray-300 border border-gray-400 rounded-lg cursor-pointer"
                        ></div>
                    ))}
                    <div className="flex">
                        <a href="#" className="w-full text-black underline flex justify-center items-center cursor-pointer">Xem thêm...</a>
                    </div>
                </div>

                <h1 className="font-bold italic px-5 py-5 cursor-pointer">Product Type</h1>
                <div className="flex flex-wrap justify-center px-5 py-5 gap-10">
                    {[...Array(12)].map((key, index) => (
                        <div 
                            key={index} 
                            className="w-45 h-60 bg-gray-300 border border-gray-400 rounded-lg cursor-pointer"
                        ></div>
                    ))}
                    <div className="flex">
                        <a href="#" className="w-full text-black underline flex justify-center items-center cursor-pointer">Xem thêm...</a>
                    </div>
                </div>

                <Footer/>
                </div>
        </>
    );
}

export default FarmHub;

