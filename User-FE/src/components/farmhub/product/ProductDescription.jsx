

const ProductDescription = ({ product }) => {
  if (!product) return null;

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">Mô tả sản phẩm</h2>
      <p className="text-gray-700 leading-relaxed">
        {product.description || "Chưa có mô tả cho sản phẩm này."}
      </p>
    </div>
  );
};

export default ProductDescription;
