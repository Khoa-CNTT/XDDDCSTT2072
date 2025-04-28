import Header from "../components/Header";
import Footer from "./Footer";

function ProductType() {
    return (
        // overflow-hidden:cắt bớt nội dung tràn
        <div className="rounded-lg border border-gray-200 overflow-hidden shadow-md"> 
            <Header />
            <div className="flex py-5 px-15 gap-10">
                <div className="p-4 w-full px-5 py-3 border border-gray rounded-lg">
                    <div className="flex gap-15">
                        <div className="font-bold cursor-pointer">All Products</div>
                        <div className="italic text-blue-600 cursor-pointer">List</div>
                        <div className="italic text-gray-700 cursor-pointer">List</div>
                        <div className="italic text-gray-700 cursor-pointer">List</div>
                        <div className="italic text-gray-700 cursor-pointer">List</div>
                    </div>
                </div>
            </div>

            <div className="flex p-4 gap-2">
                <div className="flex-[2] bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <div className="font-bold italic cursor-pointer ">Category</div>
                    <div className="font-bold px-3 cursor-pointer">Category Type</div>
                    <ul className="list-disc pl-6 ml-4">
                        <li className="cursor-pointer">List</li>
                        <li className="cursor-pointer">List</li>
                        <li className="cursor-pointer">List</li>
                        <li className="cursor-pointer">List</li>
                    </ul>
                </div>

                <div className="flex-[7] bg-gray-100 rounded-lg border border-gray-200 p-4">
                    <div className="font-bold p-2 cursor-pointer">Product Type</div>
                    <div className="flex flex-wrap gap-6 p-4">
                        {[...Array(10)].map((_, index) => (
                            <div key={index} className="w-40 h-60 bg-gray-300 rounded-lg shadow-sm"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* <div className="bg-black h-20 rounded-b-lg h-50"></div> */}
            <Footer/>
        </div>
    );
}

export default ProductType;
