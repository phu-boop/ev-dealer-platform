import apiPublic from "./apiPublic";
import apiConst from "./apiConst";

// B2C: lấy danh sách khuyến mãi đang hoạt động (PUBLIC - không cần auth)
export const getActivePromotions = () =>
  apiPublic
    .get("/sales/promotions/active")
    .then((res) => res.data);


