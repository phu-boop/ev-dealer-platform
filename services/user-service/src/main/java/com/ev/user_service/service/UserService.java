package com.ev.user_service.service;

import com.ev.user_service.entity.EvmStaffProfile;
import com.ev.user_service.enums.UserStatus;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.ev.user_service.dto.request.UserRequest;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.entity.Role;
import com.ev.user_service.entity.User;
import com.ev.user_service.enums.RoleName;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.mapper.UserMapper;
import com.ev.user_service.repository.RoleRepository;
import com.ev.user_service.repository.UserRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EvmStaffProfileService evmStaffProfileService;

    public UserService(PasswordEncoder passwordEncoder,
                       UserMapper userMapper,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       EvmStaffProfileService evmStaffProfileService ) {
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.evmStaffProfileService = evmStaffProfileService;
    }

    public List<UserRespond> getAllUser() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::usertoUserRespond)
                .collect(Collectors.toList());
    }

    public UserRespond getUserById(UUID id) {
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
        userRepository.save(user);
        return userMapper.usertoUserRespond(user);
    }

    public UserRespond createUserDealerStaff(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        } else if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User user = userMapper.userRequesttoUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(RoleName.DEALER_STAFF.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(userRole);
        user.setRoles(roles);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        return userMapper.usertoUserRespond(user);
    }

    public UserRespond createUserEvmStaff(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        } else if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User user = userMapper.userRequesttoUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(RoleName.EVM_STAFF.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(userRole);
        user.setRoles(roles);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        evmStaffProfileService.SaveEvmStaffProfile(user, userRequest.getDepartment(), userRequest.getSpecialization());
        return userMapper.usertoUserRespond(user);
    }

    public UserRespond updateUser(UUID id, UserRequest userRequest) {
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

    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }
}
