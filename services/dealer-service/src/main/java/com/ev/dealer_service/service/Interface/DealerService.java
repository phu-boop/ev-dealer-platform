package com.ev.dealer_service.service.Interface;

import com.ev.dealer_service.dto.response.DealerBasicDto;
import com.ev.dealer_service.dto.request.DealerRequest;
import com.ev.dealer_service.dto.response.DealerResponse;
import java.util.List;

/**
 * Interface for Dealer operations.
 */
public interface DealerService {

    /**
     * Lấy tất cả các đại lý.
     * @return danh sách DealerResponse
     */
    List<DealerResponse> getAllDealers();

    /**
     * Lấy đại lý theo ID.
     * @param id ID của đại lý
     * @return DealerResponse
     */
    DealerResponse getDealerById(Long id);

    /**
     * Lấy đại lý theo mã (code).
     * @param code Mã của đại lý
     * @return DealerResponse
     */
    DealerResponse getDealerByCode(String code);

    /**
     * Tìm kiếm đại lý theo từ khóa.
     * @param keyword Từ khóa tìm kiếm
     * @return danh sách DealerResponse
     */
    List<DealerResponse> searchDealers(String keyword);

    /**
     * Lấy đại lý theo thành phố.
     * @param city Tên thành phố
     * @return danh sách DealerResponse
     */
    List<DealerResponse> getDealersByCity(String city);

    /**
     * Tạo một đại lý mới.
     * @param request thông tin đại lý mới
     * @return DealerResponse của đại lý đã tạo
     */
    DealerResponse createDealer(DealerRequest request);

    /**
     * Cập nhật thông tin đại lý.
     * @param id ID của đại lý cần cập nhật
     * @param request thông tin cập nhật
     * @return DealerResponse của đại lý đã cập nhật
     */
    DealerResponse updateDealer(Long id, DealerRequest request);

    /**
     * Xóa một đại lý.
     * @param id ID của đại lý cần xóa
     */
    void deleteDealer(Long id);

    /**
     * Lấy danh sách rút gọn (ID và Tên) của tất cả đại lý.
     */
    List<DealerBasicDto> getAllDealersBasicInfo();

}
