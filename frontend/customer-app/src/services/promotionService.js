import apiConst from "./apiConst";

// B2C: lấy danh sách khuyến mãi đang hoạt động
export const getActivePromotions = () =>
  apiConst
    .get("/sales/promotions/active")
    .then((res) => res.data);


