import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  getB2BCatalogModels,
  createB2BOrder,
} from "../services/dealerSalesService";

const B2BOrderPage = () => {
  const [catalog, setCatalog] = useState([]); // Danh sách xe có thể đặt
  const [cart, setCart] = useState([]); // Các xe trong giỏ hàng
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Tải danh mục xe khi trang được mở
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await getB2BCatalogModels();
        // Giả sử mỗi model có 1 mảng variants
        const allVariants = res.data.data.flatMap((model) =>
          model.variants.map((variant) => ({
            ...variant,
            modelName: model.modelName,
            brand: model.brand,
          }))
        );
        setCatalog(allVariants);
      } catch (error) {
        console.error("Failed to fetch catalog", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // 2. Hàm thêm xe vào giỏ hàng
  const handleAddToCart = (variant, quantity) => {
    if (!quantity || quantity <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    // Kiểm tra xem đã có trong giỏ chưa
    const existingItem = cart.find(
      (item) => item.variantId === variant.variantId
    );
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.variantId === variant.variantId
            ? { ...item, quantity: item.quantity + Number(quantity) }
            : item
        )
      );
    } else {
      setCart([...cart, { ...variant, quantity: Number(quantity) }]);
    }
  };

  // 3. Hàm gửi đơn hàng B2B
  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      await createB2BOrder(orderData);
      alert("Đã gửi đơn đặt hàng thành công! Vui lòng chờ EVM duyệt.");
      setCart([]);
    } catch (error) {
      alert(
        "Lỗi khi gửi đơn hàng: " +
          (error.response?.data?.message || "Lỗi máy chủ")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in-0 duration-500">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Đặt Xe Từ Hãng</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột 1 & 2: Danh sách xe có thể đặt */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold">Danh mục xe</h2>
          {isLoading ? (
            <p>Đang tải danh mục...</p>
          ) : (
            catalog.map((variant) => (
              <ProductItem
                key={variant.variantId}
                variant={variant}
                onAddToCart={handleAddToCart}
              />
            ))
          )}
        </div>

        {/* Cột 3: Giỏ hàng */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg sticky top-28">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FiShoppingCart className="mr-2" /> Đơn Hàng Của Bạn
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {cart.length === 0 && (
                <p className="text-gray-500">Chưa có xe nào trong đơn hàng.</p>
              )}
              {cart.map((item) => (
                <div
                  key={item.variantId}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {item.modelName} {item.versionName}
                    </p>
                    <p className="text-sm text-gray-500">{item.color}</p>
                  </div>
                  <p className="font-bold">SL: {item.quantity}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || cart.length === 0}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi Đơn Đặt Hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component con để hiển thị 1 xe trong danh mục
const ProductItem = ({ variant, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
      <div>
        <p className="text-lg font-bold">
          {variant.brand} {variant.modelName} {variant.versionName}
        </p>
        <p className="text-sm text-gray-600">
          {variant.color} - SKU: {variant.skuCode}
        </p>
        <p className="text-lg font-semibold text-blue-600 mt-1">
          {Number(variant.wholesalePrice || variant.price).toLocaleString(
            "vi-VN"
          )}{" "}
          VNĐ
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          className="w-20 p-2 border rounded-lg"
        />
        <button
          onClick={() => onAddToCart(variant, quantity)}
          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          <FiPlus />
        </button>
      </div>
    </div>
  );
};

export default B2BOrderPage;
