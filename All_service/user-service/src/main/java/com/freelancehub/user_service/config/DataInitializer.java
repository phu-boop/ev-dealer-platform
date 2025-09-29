package com.freelancehub.user_service.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.freelancehub.user_service.entity.Permission;
import com.freelancehub.user_service.entity.Role;
import com.freelancehub.user_service.entity.User;
import com.freelancehub.user_service.enums.PermissionName;
import com.freelancehub.user_service.enums.RoleName;
import com.freelancehub.common_lib.exception.AppException;
import com.freelancehub.common_lib.exception.ErrorCode;
import com.freelancehub.user_service.repository.PermissionRepository;
import com.freelancehub.user_service.repository.RoleRepository;
import com.freelancehub.user_service.repository.UserRepository;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            if (roleRepository.findByName(RoleName.ADMIN.getRoleName()).isEmpty()) {
                Set<Permission> permissions = new HashSet<>();
                Permission permission = new Permission();
                permission.setName(PermissionName.DELETE.getPermissionName());
                permissions.add(permission);
                permissionRepository.save(permission);
                Role role = new Role();
                role.setName(RoleName.ADMIN.getRoleName());
                role.setPermissions(permissions);
                roleRepository.save(role);
            }
            if (roleRepository.findByName(RoleName.USER.getRoleName()).isEmpty()) {
                Set<Permission> permissions = new HashSet<>();
                Permission permission = new Permission();
                permission.setName(PermissionName.READ.getPermissionName());
                permissions.add(permission);
                permissionRepository.save(permission);
                Role role = new Role();
                role.setName(RoleName.USER.getRoleName());
                role.setPermissions(permissions);
                roleRepository.save(role);
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
