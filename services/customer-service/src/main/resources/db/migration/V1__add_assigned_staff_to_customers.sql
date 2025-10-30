-- Migration script để thêm cột assigned_staff_id vào bảng customers
-- File: V1__add_assigned_staff_to_customers.sql
-- Chạy script này để update database schema

USE ev_dealer_platform;

-- Thêm cột assigned_staff_id vào bảng customers
ALTER TABLE customers 
ADD COLUMN assigned_staff_id BIGINT NULL COMMENT 'ID của nhân viên được phân công chăm sóc khách hàng';

-- Thêm index để tối ưu query theo assigned_staff_id
CREATE INDEX idx_customers_assigned_staff ON customers(assigned_staff_id);

-- Comment mô tả
ALTER TABLE customers 
MODIFY COLUMN assigned_staff_id BIGINT NULL 
COMMENT 'ID của nhân viên được phân công chăm sóc khách hàng (foreign key tới user_service.users)';

-- Note: assigned_staff_id là foreign key tham chiếu đến bảng users trong user-service
-- Do đây là microservices architecture, không tạo foreign key constraint
