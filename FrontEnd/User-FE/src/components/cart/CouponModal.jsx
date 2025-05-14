import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import * as Dialog from "@radix-ui/react-dialog";
import { FaTag, FaTimes, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import CouponList from "../product/CouponList";
import { Button } from "@/components/ui/button";

const CouponModal = ({
  isOpen,
  onClose,
  coupons,
  loading,
  onSelectCoupon,
  selectedCoupon,
  orderAmount,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCoupons, setFilteredCoupons] = useState([]);

  // Lọc coupon theo từ khóa tìm kiếm
  useEffect(() => {
    if (!Array.isArray(coupons)) {
      setFilteredCoupons([]);
      return;
    }

    // Lọc theo từ khóa
    const filtered = coupons.filter(
      (coupon) =>
        coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (coupon.description &&
          coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredCoupons(filtered);
  }, [coupons, searchTerm]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <AnimatePresence>
          {isOpen && (
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white w-full max-w-2xl rounded-lg shadow-xl relative z-10"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                >
                  {/* Header */}
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <Dialog.Title className="text-lg font-medium flex items-center gap-2">
                      <FaTag className="text-green-500" />
                      <span>Chọn Mã Giảm Giá</span>
                    </Dialog.Title>
                    <Dialog.Close className="text-gray-500 hover:text-gray-700 focus:outline-none">
                      <FaTimes />
                    </Dialog.Close>
                  </div>

                  {/* Search bar */}
                  <div className="px-6 py-3 border-b">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" size={14} />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm mã giảm giá..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                    {/* Thông tin đơn hàng */}
                    <div className="mb-4 bg-gray-50 p-3 rounded-md text-sm">
                      <p>
                        Đơn hàng:{" "}
                        <span className="font-medium">
                          {orderAmount.toLocaleString()}đ
                        </span>
                      </p>
                    </div>

                    {/* Danh sách mã giảm giá */}
                    <div className="mb-4">
                      <h3 className="font-medium mb-2 text-gray-800">
                        Tất cả mã giảm giá
                      </h3>
                      {loading ? (
                        <div className="animate-pulse space-y-2">
                          <div className="h-20 bg-gray-100 rounded-md"></div>
                          <div className="h-20 bg-gray-100 rounded-md"></div>
                        </div>
                      ) : filteredCoupons.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          {searchTerm
                            ? "Không tìm thấy mã giảm giá phù hợp"
                            : "Không có mã giảm giá nào"}
                        </div>
                      ) : (
                        <CouponList
                          coupons={filteredCoupons}
                          loading={false}
                          onSelectCoupon={onSelectCoupon}
                          selectedCoupon={selectedCoupon}
                        />
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t flex justify-between">
                    <Button
                      onClick={onClose}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2"
                    >
                      Trở lại
                    </Button>
                    <Button
                      onClick={onClose}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
                    >
                      OK
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

CouponModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  coupons: PropTypes.array,
  loading: PropTypes.bool,
  onSelectCoupon: PropTypes.func,
  selectedCoupon: PropTypes.object,
  orderAmount: PropTypes.number,
};

CouponModal.defaultProps = {
  coupons: [],
  loading: false,
  orderAmount: 0,
};

export default CouponModal;
