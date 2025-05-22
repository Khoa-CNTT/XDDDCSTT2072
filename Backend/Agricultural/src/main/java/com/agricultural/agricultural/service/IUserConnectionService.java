package com.agricultural.agricultural.service;

import com.agricultural.agricultural.dto.UserConnectionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface IUserConnectionService {
    

    UserConnectionDTO sendConnectionRequest(Integer userId, Integer targetUserId);
    

    UserConnectionDTO acceptConnectionRequest(Integer userId, Integer requesterId);
    

    UserConnectionDTO rejectConnectionRequest(Integer userId, Integer requesterId);
    

    UserConnectionDTO blockUser(Integer userId, Integer targetUserId);
    

    UserConnectionDTO unblockUser(Integer userId, Integer targetUserId);
    

    void removeConnection(Integer userId, Integer connectedUserId);
    

    Page<UserConnectionDTO> getUserConnections(Integer userId, Pageable pageable);
    

    List<UserConnectionDTO> getPendingRequests(Integer userId);
    


    boolean areUsersConnected(Integer userId1, Integer userId2);
    

    long countUserConnections(Integer userId);
    

    List<Integer> getConnectedUserIds(Integer userId);

    Map<String, Object> checkConnectionStatus(Integer userId, Integer targetUserId);
    

    List<UserConnectionDTO> getAllUserConnections(Integer userId, String status);
} 