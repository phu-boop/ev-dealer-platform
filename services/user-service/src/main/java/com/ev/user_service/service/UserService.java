package com.ev.user_service.service;

import com.ev.user_service.dto.respond.ProfileRespond;
import com.ev.user_service.entity.*;
import com.ev.user_service.enums.UserStatus;
import com.ev.user_service.repository.*;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.ev.user_service.dto.request.UserRequest;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.enums.RoleName;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.mapper.UserMapper;
import reactor.core.publisher.Sinks;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private final AdminProfileService adminProfileService;
    private final DealerManagerProfileService dealerManagerProfileService;
    private final DealerStaffProfileService dealerStaffProfileService;
    private final DealerStaffProfileRepository dealerStaffProfileRepository;
    private final DealerManagerProfileRepository dealerManagerProfileRepository;
    private final EvmStaffProfileRepository evmStaffProfileRepository;
    private final AdminProfileRepository adminProfileRepository;

    public UserService(PasswordEncoder passwordEncoder,
                       UserMapper userMapper,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       EvmStaffProfileService evmStaffProfileService,
                       AdminProfileService adminProfileService,
                       DealerStaffProfileService dealerStaffProfileService,
                       DealerManagerProfileService dealerManagerProfileService,
                       DealerStaffProfileRepository dealerStaffProfileRepository,
                       DealerManagerProfileRepository dealerManagerProfileRepository,
                       EvmStaffProfileRepository evmStaffProfileRepository,
                       AdminProfileRepository adminProfileRepository
    ) {
        this.adminProfileService = adminProfileService;
        this.dealerManagerProfileService = dealerManagerProfileService;
        this.dealerStaffProfileService = dealerStaffProfileService;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.evmStaffProfileService = evmStaffProfileService;
        this.adminProfileRepository = adminProfileRepository;
        this.dealerStaffProfileRepository = dealerStaffProfileRepository;
        this.dealerManagerProfileRepository = dealerManagerProfileRepository;
        this.evmStaffProfileRepository = evmStaffProfileRepository;
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
        dealerStaffProfileService.SaveDealerStaffProfile(user, userRequest.getDealerId(), userRequest.getPosition(), userRequest.getDepartment(), userRequest.getHireDate(), userRequest.getSalary(), userRequest.getCommissionRate());
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


    public UserRespond createUserDealerManager(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        } else if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User user = userMapper.userRequesttoUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(RoleName.DEALER_MANAGER.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(userRole);
        user.setRoles(roles);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        dealerManagerProfileService.SaveDealerManagerProfile(user, userRequest
                .getDealerId(), userRequest.getManagementLevel(), userRequest.getApprovalLimit(), userRequest.getDepartment());
        return userMapper.usertoUserRespond(user);
    }


    public UserRespond createUserDealerAdmin(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        } else if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User user = userMapper.userRequesttoUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(RoleName.ADMIN.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(userRole);
        user.setRoles(roles);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        adminProfileService.SaveAdminProfile(user, "SYSTEM_ADMIN", "Quản lý người dùng", "Regional Admin");
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

    public ProfileRespond getCurrentProfileByIdUser(UUID id_user) {
        User user = userRepository.findById(id_user)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setPassword("đoán xemmmm");
        ProfileRespond.ProfileRespondBuilder builder = ProfileRespond.builder().user(user);

        return builder.build();
    }

}
