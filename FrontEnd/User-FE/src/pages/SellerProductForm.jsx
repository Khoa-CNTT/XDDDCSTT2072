import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { FaArrowLeft, FaUpload, FaTrash } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SellerProductForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  // Form state
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    shortDescription: "",
    quantity: 1,
    price: "",
    salePrice: "",
    saleStartDate: null,
    saleEndDate: null,
    categoryId: "",
    imageFile: null,
  });

  // UI state
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [showSaleFields, setShowSaleFields] = useState(false);

  // Fetch product data if in edit mode
  useEffect(() => {
    const fetchProductData = async () => {
      if (isEditMode) {
        try {
          const response = await axiosPrivate.get(`/marketplace/product/${id}`);
          const productData = response.data;

          // Convert string dates to Date objects
          const saleStartDate = productData.saleStartDate
            ? new Date(productData.saleStartDate)
            : null;
          const saleEndDate = productData.saleEndDate
            ? new Date(productData.saleEndDate)
            : null;

          setFormData({
            productName: productData.productName || "",
            description: productData.description || "",
            shortDescription: productData.shortDescription || "",
            quantity: productData.quantity || 1,
            price: productData.price || "",
            salePrice: productData.salePrice || "",
            saleStartDate: saleStartDate,
            saleEndDate: saleEndDate,
            categoryId: productData.categoryId?.toString() || "",
            imageFile: null,
          });

          setPreviewImage(productData.imageUrl || "");
          setShowSaleFields(!!productData.salePrice);
        } catch (error) {
          console.error("Error fetching product:", error);
          alert("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
          navigate("/seller/dashboard");
        } finally {
          setLoading(false);
        }
      }
    };

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axiosPrivate.get("/product-categories");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    fetchProductData();
  }, [axiosPrivate, id, isEditMode, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData({ ...formData, [name]: value === "" ? "" : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });

    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      alert("Vui lòng chọn file hình ảnh.");
      return;
    }

    // Preview the image
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    setFormData({ ...formData, imageFile: file });

    // Clear validation error
    if (formErrors.imageFile) {
      setFormErrors({ ...formErrors, imageFile: null });
    }
  };

  // Handle form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.productName.trim()) {
      errors.productName = "Vui lòng nhập tên sản phẩm";
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = "Giá sản phẩm phải lớn hơn 0";
    }

    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = "Số lượng phải lớn hơn 0";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Vui lòng chọn danh mục sản phẩm";
    }

    if (!isEditMode && !formData.imageFile && !previewImage) {
      errors.imageFile = "Vui lòng chọn hình ảnh sản phẩm";
    }

    if (showSaleFields) {
      if (!formData.salePrice || formData.salePrice <= 0) {
        errors.salePrice = "Giá khuyến mãi phải lớn hơn 0";
      }

      if (parseFloat(formData.salePrice) >= parseFloat(formData.price)) {
        errors.salePrice = "Giá khuyến mãi phải nhỏ hơn giá gốc";
      }

      if (!formData.saleStartDate) {
        errors.saleStartDate = "Vui lòng chọn ngày bắt đầu khuyến mãi";
      }

      if (!formData.saleEndDate) {
        errors.saleEndDate = "Vui lòng chọn ngày kết thúc khuyến mãi";
      }

      if (
        formData.saleStartDate &&
        formData.saleEndDate &&
        formData.saleStartDate >= formData.saleEndDate
      ) {
        errors.saleEndDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare form data for API
      const productFormData = new FormData();
      productFormData.append("productName", formData.productName);
      productFormData.append("description", formData.description || "");
      productFormData.append(
        "shortDescription",
        formData.shortDescription || ""
      );
      productFormData.append("quantity", formData.quantity);
      productFormData.append("price", formData.price);
      productFormData.append("categoryId", formData.categoryId);

      if (
        showSaleFields &&
        formData.salePrice &&
        formData.saleStartDate &&
        formData.saleEndDate
      ) {
        productFormData.append("salePrice", formData.salePrice);

        // Format datetime trong định dạng mà Java LocalDateTime có thể hiểu
        // Chuyển từ JavaScript Date sang yyyy-MM-dd'T'HH:mm:ss
        const formatDateForJava = (date) => {
          if (!date) return null;
          // Format: yyyy-MM-dd'T'HH:mm:ss
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");

          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        const startDate = formatDateForJava(formData.saleStartDate);
        const endDate = formatDateForJava(formData.saleEndDate);

        console.log("Sending sale dates:", { startDate, endDate });

        productFormData.append("saleStartDate", startDate);
        productFormData.append("saleEndDate", endDate);
      }

      if (formData.imageFile) {
        productFormData.append("imageFile", formData.imageFile);
      }

      let response;
      if (isEditMode) {
        // Update existing product
        response = await axiosPrivate.put(
          `/marketplace/update/${id}`,
          productFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Create new product
        response = await axiosPrivate.post(
          "/marketplace/create",
          productFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        alert(
          isEditMode
            ? "Sản phẩm đã được cập nhật!"
            : "Sản phẩm đã được tạo thành công!"
        );
        navigate("/seller/dashboard");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      alert(
        `Lỗi khi ${isEditMode ? "cập nhật" : "tạo"} sản phẩm. Vui lòng thử lại.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16 flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="ml-4 text-gray-600">Đang tải...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 mt-16 flex-grow">
        <button
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          onClick={() => navigate("/seller/dashboard")}
        >
          <FaArrowLeft className="mr-2" /> Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.productName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                    placeholder="Nhập tên sản phẩm"
                  />
                  {formErrors.productName && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.productName}
                    </p>
                  )}
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả ngắn
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập mô tả ngắn"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      className={`w-full px-3 py-2 border ${
                        formErrors.price ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">đ</span>
                    </div>
                  </div>
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border ${
                      formErrors.quantity ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                    placeholder="1"
                  />
                  {formErrors.quantity && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.quantity}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.categoryId
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.categoryId}
                    </p>
                  )}
                </div>

                {/* Sale checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableSale"
                    checked={showSaleFields}
                    onChange={() => setShowSaleFields(!showSaleFields)}
                    className="rounded text-green-500 focus:ring-green-500 mr-2"
                  />
                  <label
                    htmlFor="enableSale"
                    className="text-sm font-medium text-gray-700"
                  >
                    Thêm khuyến mãi
                  </label>
                </div>

                {/* Conditional Sale Fields */}
                {showSaleFields && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                    {/* Sale Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá khuyến mãi <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="salePrice"
                          value={formData.salePrice}
                          onChange={handleInputChange}
                          min="0"
                          step="1000"
                          className={`w-full px-3 py-2 border ${
                            formErrors.salePrice
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                          placeholder="0"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500">đ</span>
                        </div>
                      </div>
                      {formErrors.salePrice && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.salePrice}
                        </p>
                      )}
                    </div>

                    {/* Sale Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.saleStartDate}
                        onChange={(date) =>
                          handleDateChange("saleStartDate", date)
                        }
                        showTimeSelect
                        dateFormat="dd/MM/yyyy HH:mm"
                        className={`w-full px-3 py-2 border ${
                          formErrors.saleStartDate
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                        placeholderText="Chọn ngày bắt đầu"
                      />
                      {formErrors.saleStartDate && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.saleStartDate}
                        </p>
                      )}
                    </div>

                    {/* Sale End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày kết thúc <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.saleEndDate}
                        onChange={(date) =>
                          handleDateChange("saleEndDate", date)
                        }
                        showTimeSelect
                        dateFormat="dd/MM/yyyy HH:mm"
                        className={`w-full px-3 py-2 border ${
                          formErrors.saleEndDate
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                        placeholderText="Chọn ngày kết thúc"
                        minDate={formData.saleStartDate}
                      />
                      {formErrors.saleEndDate && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.saleEndDate}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập mô tả chi tiết sản phẩm"
                  ></textarea>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình ảnh sản phẩm{" "}
                    {!isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
                    {previewImage ? (
                      <div className="space-y-2 text-center">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="mx-auto h-40 w-auto object-contain"
                        />
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage("");
                              setFormData({ ...formData, imageFile: null });
                            }}
                            className="text-red-500 hover:text-red-700 flex items-center"
                          >
                            <FaTrash className="mr-1" /> Xóa ảnh
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                          >
                            <span className="flex items-center">
                              <FaUpload className="mr-2" /> Chọn hình ảnh
                            </span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF tối đa 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  {formErrors.imageFile && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.imageFile}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/seller/dashboard")}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  submitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : isEditMode ? (
                  "Cập nhật sản phẩm"
                ) : (
                  "Thêm sản phẩm"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellerProductForm;
