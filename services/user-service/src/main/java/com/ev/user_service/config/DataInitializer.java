package com.ev.user_service.config;

import com.ev.user_service.entity.EvmStaffProfile;
import com.ev.user_service.enums.UserStatus;
import com.ev.user_service.service.AdminProfileService;
import com.ev.user_service.service.DealerManagerProfileService;
import com.ev.user_service.service.DealerStaffProfileService;
import com.ev.user_service.service.EvmStaffProfileService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.ev.user_service.entity.Permission;
import com.ev.user_service.entity.Role;
import com.ev.user_service.entity.User;
import com.ev.user_service.enums.PermissionName;
import com.ev.user_service.enums.RoleName;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.repository.PermissionRepository;
import com.ev.user_service.repository.RoleRepository;
import com.ev.user_service.repository.UserRepository;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AdminProfileService adminProfileService;
    private final DealerManagerProfileService dealerManagerProfileService;
    private final EvmStaffProfileService evmStaffProfileService;
    private final DealerStaffProfileService dealerStaffProfileService;

    // Helper method
    private Permission createPermission(PermissionName permissionName) {
        Permission permission = new Permission();
        permission.setName(permissionName.getName());
        return permission;
    }

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            AdminProfileService adminProfileService,
            DealerManagerProfileService dealerManagerProfileService,
            EvmStaffProfileService evmStaffProfileService,
            DealerStaffProfileService dealerStaffProfileService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.adminProfileService = adminProfileService;
        this.dealerManagerProfileService = dealerManagerProfileService;
        this.evmStaffProfileService = evmStaffProfileService;
        this.dealerStaffProfileService =dealerStaffProfileService;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            if (roleRepository.findByName(RoleName.ADMIN.getName()).isEmpty()) {
                // ADMIN role
                if (roleRepository.findByName(RoleName.ADMIN.getName()).isEmpty()) {
                    Set<Permission> permissions = new HashSet<>();

                    // Chỉ các quyền đặc biệt của ADMIN
                    permissions.add(createPermission(PermissionName.FULL_SYSTEM_ACCESS));
                    permissions.add(createPermission(PermissionName.MANAGE_USERS));
                    permissions.add(createPermission(PermissionName.VIEW_AI_REPORTS));
                    permissions.add(createPermission(PermissionName.SYSTEM_CONFIG));

                    permissionRepository.saveAll(permissions);
                    Role role = new Role();
                    role.setName(RoleName.ADMIN.getName());
                    role.setPermissions(permissions);
                    roleRepository.save(role);
                }

            }
            // Init default users for EVM system
            Set<Role> roles = new HashSet<>();

            // ========== ADMIN ==========
            Role adminRole = roleRepository.findByName(RoleName.ADMIN.getRoleName())
                    .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
            roles.clear();
            roles.add(adminRole);
            User admin = new User();
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("123123123"));
            admin.setRoles(new HashSet<>(roles));
            admin.setStatus(UserStatus.ACTIVE);
            userRepository.save(admin);
            adminProfileService.SaveAdminProfile(admin, "SUPER_ADMIN", "Toàn quyền hệ thống", "GLOBAL");
        }
    }
}
