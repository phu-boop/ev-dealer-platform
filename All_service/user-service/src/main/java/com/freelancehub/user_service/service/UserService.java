package com.freelancehub.user_service.service;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.freelancehub.user_service.dto.request.UserRequest;
import com.freelancehub.user_service.dto.respond.UserRespond;
import com.freelancehub.user_service.entity.Role;
import com.freelancehub.user_service.entity.User;
import com.freelancehub.user_service.enums.RoleName;
import com.freelancehub.common_lib.exception.AppException;
import com.freelancehub.common_lib.exception.ErrorCode;
import com.freelancehub.user_service.mapper.UserMapper;
import com.freelancehub.user_service.repository.RoleRepository;
import com.freelancehub.user_service.repository.UserRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(PasswordEncoder passwordEncoder,
                       UserMapper userMapper,
                       UserRepository userRepository,
                       RoleRepository roleRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public List<UserRespond> getAllUser() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::usertoUserRespond)
                .collect(Collectors.toList());
    }

    public UserRespond getUserById(long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.usertoUserRespond(user);
    }

    public UserRespond createUser(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        } else if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User user = userMapper.userRequesttoUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(RoleName.USER.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(userRole);
        user.setRoles(roles);
        userRepository.save(user);
        return userMapper.usertoUserRespond(user);
    }

    public UserRespond updateUser(Long id, UserRequest userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (!user.getEmail().equals(userRequest.getEmail())
                && userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (!user.getPhone().equals(userRequest.getPhone())
                && userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        userMapper.updateUserFromRequest(userRequest, user);
        userRepository.save(user);
        return userMapper.usertoUserRespond(user);
    }

    public void deleteUser(Long id) {
        userRepository.delete(getUserById(id));
    }

    private User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
