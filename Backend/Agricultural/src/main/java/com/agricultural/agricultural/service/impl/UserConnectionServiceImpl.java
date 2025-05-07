package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.UserConnectionDTO;
import com.agricultural.agricultural.entity.User;
import com.agricultural.agricultural.entity.UserConnection;
import com.agricultural.agricultural.exception.BadRequestException;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.repository.IUserConnectionRepository;
import com.agricultural.agricultural.repository.IUserRepository;
import com.agricultural.agricultural.service.IUserConnectionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserConnectionServiceImpl implements IUserConnectionService {

    private final IUserConnectionRepository userConnectionRepository;
    private final IUserRepository userRepository;

    @Override
    @Transactional
    public UserConnectionDTO sendConnectionRequest(Integer userId, Integer targetUserId) {
        // Kiểm tra nếu người dùng đang gửi kết nối đến chính mình
        if (userId.equals(targetUserId)) {
            throw new BadRequestException("Không thể gửi yêu cầu kết nối đến chính mình");
        }

        // Tìm người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + targetUserId));

        // Kiểm tra nếu đã có kết nối
        Optional<UserConnection> existingConnection = userConnectionRepository
                .findByUserIdAndConnectedUserId(userId, targetUserId);

        if (existingConnection.isPresent()) {
            UserConnection connection = existingConnection.get();
            if (connection.getStatus() == UserConnection.ConnectionStatus.PENDING) {
                throw new BadRequestException("Đã gửi yêu cầu kết nối đến người dùng này");
            } else if (connection.getStatus() == UserConnection.ConnectionStatus.ACCEPTED) {
                throw new BadRequestException("Đã kết nối với người dùng này");
            } else if (connection.getStatus() == UserConnection.ConnectionStatus.BLOCKED) {
                throw new BadRequestException("Không thể gửi yêu cầu kết nối đến người dùng đã chặn");
            } else { // REJECTED - có thể gửi lại yêu cầu
                connection.setStatus(UserConnection.ConnectionStatus.PENDING);
                UserConnection savedConnection = userConnectionRepository.save(connection);
                return mapToDTO(savedConnection);
            }
        }

        // Kiểm tra nếu có kết nối theo chiều ngược lại
        Optional<UserConnection> reverseConnection = userConnectionRepository
                .findByUserIdAndConnectedUserId(targetUserId, userId);

        if (reverseConnection.isPresent()) {
            UserConnection connection = reverseConnection.get();
            if (connection.getStatus() == UserConnection.ConnectionStatus.PENDING) {
                // Nếu người kia đã gửi yêu cầu, ta chấp nhận luôn
                connection.setStatus(UserConnection.ConnectionStatus.ACCEPTED);
                UserConnection savedConnection = userConnectionRepository.save(connection);
                return mapToDTO(savedConnection);
            } else if (connection.getStatus() == UserConnection.ConnectionStatus.ACCEPTED) {
                throw new BadRequestException("Đã kết nối với người dùng này");
            } else if (connection.getStatus() == UserConnection.ConnectionStatus.BLOCKED) {
                throw new BadRequestException("Người dùng này đã chặn bạn");
            }
        }

        // Tạo kết nối mới
        UserConnection connection = UserConnection.builder()
                .user(user)
                .connectedUser(targetUser)
                .status(UserConnection.ConnectionStatus.PENDING)
                .build();

        UserConnection savedConnection = userConnectionRepository.save(connection);
        return mapToDTO(savedConnection);
    }

    @Override
    @Transactional
    public UserConnectionDTO acceptConnectionRequest(Integer userId, Integer requesterId) {
        // Tìm yêu cầu kết nối
        Optional<UserConnection> connectionOptional = userConnectionRepository
                .findByUserIdAndConnectedUserId(requesterId, userId);

        if (connectionOptional.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy yêu cầu kết nối");
        }

        UserConnection connection = connectionOptional.get();
        if (connection.getStatus() != UserConnection.ConnectionStatus.PENDING) {
            throw new BadRequestException("Yêu cầu kết nối không ở trạng thái chờ chấp nhận");
        }

        // Chấp nhận yêu cầu
        connection.setStatus(UserConnection.ConnectionStatus.ACCEPTED);
        UserConnection savedConnection = userConnectionRepository.save(connection);
        return mapToDTO(savedConnection);
    }

    @Override
    @Transactional
    public UserConnectionDTO rejectConnectionRequest(Integer userId, Integer requesterId) {
        // Tìm yêu cầu kết nối
        Optional<UserConnection> connectionOptional = userConnectionRepository
                .findByUserIdAndConnectedUserId(requesterId, userId);

        if (connectionOptional.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy yêu cầu kết nối");
        }

        UserConnection connection = connectionOptional.get();
        if (connection.getStatus() != UserConnection.ConnectionStatus.PENDING) {
            throw new BadRequestException("Yêu cầu kết nối không ở trạng thái chờ chấp nhận");
        }

        // Từ chối yêu cầu
        connection.setStatus(UserConnection.ConnectionStatus.REJECTED);
        UserConnection savedConnection = userConnectionRepository.save(connection);
        return mapToDTO(savedConnection);
    }

    @Override
    @Transactional
    public UserConnectionDTO blockUser(Integer userId, Integer targetUserId) {
        // Kiểm tra nếu đã có kết nối
        Optional<UserConnection> existingConnection = userConnectionRepository
                .findByUserIdAndConnectedUserId(userId, targetUserId);

        if (existingConnection.isPresent()) {
            UserConnection connection = existingConnection.get();
            connection.setStatus(UserConnection.ConnectionStatus.BLOCKED);
            UserConnection savedConnection = userConnectionRepository.save(connection);
            return mapToDTO(savedConnection);
        }

        // Kiểm tra người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + targetUserId));

        // Tạo kết nối chặn mới
        UserConnection connection = UserConnection.builder()
                .user(user)
                .connectedUser(targetUser)
                .status(UserConnection.ConnectionStatus.BLOCKED)
                .build();

        UserConnection savedConnection = userConnectionRepository.save(connection);
        return mapToDTO(savedConnection);
    }

    @Override
    @Transactional
    public UserConnectionDTO unblockUser(Integer userId, Integer targetUserId) {
        // Tìm kết nối chặn
        Optional<UserConnection> existingConnection = userConnectionRepository
                .findByUserIdAndConnectedUserId(userId, targetUserId);

        if (existingConnection.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy kết nối với người dùng này");
        }

        UserConnection connection = existingConnection.get();
        if (connection.getStatus() != UserConnection.ConnectionStatus.BLOCKED) {
            throw new BadRequestException("Người dùng này không bị chặn");
        }

        // Xóa kết nối chặn
        userConnectionRepository.delete(connection);
        
        // Trả về trạng thái trước khi xóa
        return mapToDTO(connection);
    }

    @Override
    @Transactional
    public void removeConnection(Integer userId, Integer connectedUserId) {
        // Tìm kết nối theo cả hai chiều
        Optional<UserConnection> connection1 = userConnectionRepository
                .findByUserIdAndConnectedUserId(userId, connectedUserId);
        
        Optional<UserConnection> connection2 = userConnectionRepository
                .findByUserIdAndConnectedUserId(connectedUserId, userId);
        
        if (connection1.isEmpty() && connection2.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy kết nối giữa hai người dùng");
        }
        
        // Xóa kết nối nếu có
        connection1.ifPresent(userConnectionRepository::delete);
        connection2.ifPresent(userConnectionRepository::delete);
    }

    @Override
    public Page<UserConnectionDTO> getUserConnections(Integer userId, Pageable pageable) {
        Page<UserConnection> connections = userConnectionRepository.findAllByUserId(userId, pageable);
        return connections.map(this::mapToDTO);
    }

    @Override
    public List<UserConnectionDTO> getPendingRequests(Integer userId) {
        List<UserConnection> pendingRequests = userConnectionRepository
                .findAllByConnectedUserIdAndStatus(userId, UserConnection.ConnectionStatus.PENDING);
        
        return pendingRequests.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean areUsersConnected(Integer userId1, Integer userId2) {
        return userConnectionRepository.areConnected(userId1, userId2);
    }

    @Override
    public long countUserConnections(Integer userId) {
        return userConnectionRepository.countConnectionsByUserId(userId);
    }

    @Override
    public List<Integer> getConnectedUserIds(Integer userId) {
        return userConnectionRepository.findConnectedUserIdsByUserId(userId);
    }

    // Helper method để chuyển đổi từ entity sang DTO
    private UserConnectionDTO mapToDTO(UserConnection connection) {
        return UserConnectionDTO.builder()
                .id(connection.getId())
                .userId(connection.getUser().getId())
                .userName(connection.getUser().getUsername())
                .userAvatar(connection.getUser().getImageUrl())
                .connectedUserId(connection.getConnectedUser().getId())
                .connectedUserName(connection.getConnectedUser().getUsername())
                .connectedUserAvatar(connection.getConnectedUser().getImageUrl())
                .status(connection.getStatus().name())
                .createdAt(connection.getCreatedAt())
                .updatedAt(connection.getUpdatedAt())
                .build();
    }
} 