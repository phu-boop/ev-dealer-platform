package com.ev.user_service.config;

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

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    // Helper method
    private Permission createPermission(PermissionName permissionName) {
        Permission permission = new Permission();
        permission.setName(permissionName.getName());
        return permission;
    }

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {

            if (roleRepository.findByName(RoleName.ADMIN.getName()).isEmpty()) {
                // DEALER STAFF role
                if (roleRepository.findByName(RoleName.DEALER_STAFF.getName()).isEmpty()) {
                    Set<Permission> permissions = new HashSet<>();

                    permissions.add(createPermission(PermissionName.VIEW_VEHICLES));
                    permissions.add(createPermission(PermissionName.COMPARE_VEHICLES));
                    permissions.add(createPermission(PermissionName.CREATE_QUOTATION));
                    permissions.add(createPermission(PermissionName.CREATE_ORDER));
                    permissions.add(createPermission(PermissionName.CREATE_CONTRACT));
                    permissions.add(createPermission(PermissionName.MANAGE_OWN_CUSTOMERS));
                    permissions.add(createPermission(PermissionName.CREATE_APPOINTMENT));
                    permissions.add(createPermission(PermissionName.CREATE_FEEDBACK));
                    permissions.add(createPermission(PermissionName.PROCESS_PAYMENT));

                    permissionRepository.saveAll(permissions);
                    Role role = new Role();
                    role.setName(RoleName.DEALER_STAFF.getName());
                    role.setPermissions(permissions);
                    roleRepository.save(role);
                }

                // DEALER MANAGER role
                if (roleRepository.findByName(RoleName.DEALER_MANAGER.getName()).isEmpty()) {
                    Set<Permission> permissions = new HashSet<>();

                    // Tất cả quyền của DEALER_STAFF
                    permissions.add(createPermission(PermissionName.VIEW_VEHICLES));
                    permissions.add(createPermission(PermissionName.COMPARE_VEHICLES));
                    permissions.add(createPermission(PermissionName.CREATE_QUOTATION));
                    permissions.add(createPermission(PermissionName.CREATE_ORDER));
                    permissions.add(createPermission(PermissionName.CREATE_CONTRACT));
                    permissions.add(createPermission(PermissionName.MANAGE_OWN_CUSTOMERS));
                    permissions.add(createPermission(PermissionName.CREATE_APPOINTMENT));
                    permissions.add(createPermission(PermissionName.CREATE_FEEDBACK));
                    permissions.add(createPermission(PermissionName.PROCESS_PAYMENT));

                    // Quyền riêng của MANAGER
                    permissions.add(createPermission(PermissionName.VIEW_ALL_DEALER_ORDERS));
                    permissions.add(createPermission(PermissionName.APPROVE_ORDERS));
                    permissions.add(createPermission(PermissionName.VIEW_DEALER_REPORTS));
                    permissions.add(createPermission(PermissionName.MANAGE_DEALER_STAFF));
                    permissions.add(createPermission(PermissionName.VIEW_DEALER_INVENTORY));
                    permissions.add(createPermission(PermissionName.REQUEST_STOCK));

                    permissionRepository.saveAll(permissions);
                    Role role = new Role();
                    role.setName(RoleName.DEALER_MANAGER.getName());
                    role.setPermissions(permissions);
                    roleRepository.save(role);
                }

                // EVM STAFF role
                if (roleRepository.findByName(RoleName.EVM_STAFF.getName()).isEmpty()) {
                    Set<Permission> permissions = new HashSet<>();

                    permissions.add(createPermission(PermissionName.MANAGE_VEHICLES));
                    permissions.add(createPermission(PermissionName.MANAGE_PRICING));
                    permissions.add(createPermission(PermissionName.MANAGE_PROMOTIONS));
                    permissions.add(createPermission(PermissionName.VIEW_CENTRAL_INVENTORY));
                    permissions.add(createPermission(PermissionName.ALLOCATE_VEHICLES));
                    permissions.add(createPermission(PermissionName.MANAGE_DEALERS));
                    permissions.add(createPermission(PermissionName.VIEW_SYSTEM_REPORTS));

                    permissionRepository.saveAll(permissions);
                    Role role = new Role();
                    role.setName(RoleName.EVM_STAFF.getName());
                    role.setPermissions(permissions);
                    roleRepository.save(role);
                }

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
            Set<Role> roles = new HashSet<>();
            Role role = roleRepository.findByName(RoleName.ADMIN.getRoleName())
                    .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
            roles.add(role);
            User admin = new User();
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("123123123"));
            admin.setRoles(roles);
            userRepository.save(admin);
        }
    }
}
