package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.UserConnectionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface IUserConnectionService {
    
    /**
     * Gửi yêu cầu kết nối đến người dùng khác
     * 
     * @param userId ID người dùng gửi yêu cầu
     * @param targetUserId ID người dùng nhận yêu cầu
     * @return Thông tin về kết nối vừa tạo
     */
    UserConnectionDTO sendConnectionRequest(Integer userId, Integer targetUserId);
    
    /**
     * Chấp nhận yêu cầu kết nối
     * 
     * @param userId ID người dùng chấp nhận yêu cầu
     * @param requesterId ID người dùng đã gửi yêu cầu
     * @return Thông tin về kết nối được chấp nhận
     */
    UserConnectionDTO acceptConnectionRequest(Integer userId, Integer requesterId);
    
    /**
     * Từ chối yêu cầu kết nối
     * 
     * @param userId ID người dùng từ chối yêu cầu
     * @param requesterId ID người dùng đã gửi yêu cầu
     * @return Thông tin về kết nối bị từ chối
     */
    UserConnectionDTO rejectConnectionRequest(Integer userId, Integer requesterId);
    
    /**
     * Chặn người dùng
     * 
     * @param userId ID người dùng thực hiện chặn
     * @param targetUserId ID người dùng bị chặn
     * @return Thông tin về kết nối chặn
     */
    UserConnectionDTO blockUser(Integer userId, Integer targetUserId);
    
    /**
     * Bỏ chặn người dùng
     * 
     * @param userId ID người dùng thực hiện bỏ chặn
     * @param targetUserId ID người dùng bị bỏ chặn
     * @return Thông tin về kết nối trước khi xóa
     */
    UserConnectionDTO unblockUser(Integer userId, Integer targetUserId);
    
    /**
     * Xóa kết nối giữa hai người dùng
     * 
     * @param userId ID người dùng thực hiện xóa kết nối
     * @param connectedUserId ID người dùng bị xóa kết nối
     */
    void removeConnection(Integer userId, Integer connectedUserId);
    
    /**
     * Lấy danh sách kết nối của người dùng với phân trang
     * 
     * @param userId ID người dùng cần lấy danh sách kết nối
     * @param pageable Thông tin về phân trang
     * @return Danh sách kết nối của người dùng
     */
    Page<UserConnectionDTO> getUserConnections(Integer userId, Pageable pageable);
    
    /**
     * Lấy danh sách yêu cầu kết nối đang chờ xác nhận của người dùng
     * 
     * @param userId ID người dùng cần lấy danh sách yêu cầu kết nối
     * @return Danh sách yêu cầu kết nối đang chờ xác nhận
     */
    List<UserConnectionDTO> getPendingRequests(Integer userId);
    
    /**
     * Kiểm tra hai người dùng đã kết nối với nhau chưa
     * 
     * @param userId1 ID người dùng thứ nhất
     * @param userId2 ID người dùng thứ hai
     * @return true nếu đã kết nối, false nếu chưa kết nối
     */
    boolean areUsersConnected(Integer userId1, Integer userId2);
    
    /**
     * Đếm số lượng kết nối của người dùng
     * 
     * @param userId ID người dùng cần đếm kết nối
     * @return Số lượng kết nối
     */
    long countUserConnections(Integer userId);
    
    /**
     * Lấy danh sách ID của người dùng đã kết nối
     * 
     * @param userId ID người dùng cần lấy danh sách kết nối
     * @return Danh sách ID người dùng đã kết nối
     */
    List<Integer> getConnectedUserIds(Integer userId);
    
    /**
     * Kiểm tra trạng thái kết nối chi tiết giữa hai người dùng
     * 
     * @param userId ID người dùng hiện tại
     * @param targetUserId ID người dùng cần kiểm tra
     * @return Thông tin chi tiết về trạng thái kết nối
     */
    Map<String, Object> checkConnectionStatus(Integer userId, Integer targetUserId);
    
    /**
     * Lấy tất cả kết nối của người dùng từ cả hai hướng (user_id và connected_user_id)
     * với trạng thái cụ thể
     * 
     * @param userId ID người dùng cần lấy danh sách kết nối
     * @param status Trạng thái kết nối cần lọc (mặc định là ACCEPTED)
     * @return Danh sách kết nối của người dùng từ cả hai hướng
     */
    List<UserConnectionDTO> getAllUserConnections(Integer userId, String status);
} 