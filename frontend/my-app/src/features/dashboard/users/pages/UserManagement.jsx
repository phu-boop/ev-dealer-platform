import React, {useState, useEffect} from "react";
import {mngUserService} from "../services/mngUserService.js";
import UserForm from "../components/UserForm.jsx";
import UserTable from "../components/UserTable.jsx";
import UserFilters from "../components/UserFilters.jsx";
import UserPagination from "../components/UserPagination.jsx";
import Swal from "sweetalert2";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null); // Thêm state cho user đang xem
    const [message, setMessage] = useState("");
    const [mode, setMode] = useState(""); // 'add', 'edit', 'view'

    // Search/Filter/Sort
    const [searchText, setSearchText] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [sortField, setSortField] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await mngUserService.getAll();
            if (response.data.code === "1000") {
                setUsers(response.data.data);
                showMessage("Tải danh sách user thành công");
            } else {
                showMessage("Lỗi khi tải danh sách user");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            showMessage("Không thể tải danh sách user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = () => {
        setEditingUser(null);
        setViewingUser(null);
        setMode("add");
        setModalOpen(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setViewingUser(null);
        setMode("edit");
        setModalOpen(true);
    };

    const handleViewUser = (user) => {
        setViewingUser(user);
        setEditingUser(null);
        setMode("view");
        setModalOpen(true);
    };

    const handleDeleteUser = async (userId) => {
        const result = await Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Bạn sẽ không thể hoàn tác hành động này!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Có, xóa người dùng!",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                await mngUserService.delete(userId);
                Swal.fire("Đã xóa!", "Người dùng đã được xóa.", "success");
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
                Swal.fire("Lỗi!", "Không thể xóa người dùng.", "error");
            }
        }
    };

    const handleSubmitUser = async (userData) => {
        try {
            if (mode === "edit") {
                await mngUserService.update(editingUser.id, userData);
                showMessage("Cập nhật user thành công");
            } else {
                if(userData.role === "EVM_STAFF"){
                await mngUserService.createEvmStaff(userData);
                }else if(userData.role === "DEALER_MANAGER"){
                await mngUserService.createDealerManager(userData);
                }else if(userData.role === "DEALER_STAFF"){
                await mngUserService.createDealerStaff(userData);
                }else if(userData.role === "ADMIN"){
                await mngUserService.createAmind(userData);
                }else{
                    throw new Error("Vui lòng chọn vai trò hợp lệ");
                }
                showMessage("Thêm user thành công");
            }
            setModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Error saving user:", error);
            Swal.fire({
                icon: 'error',          // Biểu tượng lỗi
                title: 'Oops...',        // Tiêu đề
                text: error.response.data.message,           // Nội dung thông báo
                confirmButtonText: 'OK'  // Nút xác nhận
            });
        }
    };

    // Filter + Search + Sort
    const filteredUsers = users
        .filter((user) => {
            const textMatch =
                user.email.toLowerCase().includes(searchText.toLowerCase()) ||
                user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
                user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                user.phone?.includes(searchText);

            const roleMatch =
                !filterRole || user.roles.some((role) => role.name === filterRole);

            return textMatch && roleMatch;
        })
        .sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (sortField === "createdAt" && aValue) {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    // Pagination
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div>
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Quản lý và theo dõi tất cả người dùng trong hệ thống
                </p>
            </div>

            {/* Message Alert */}
            {message && (
                <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
                    {message}
                </div>
            )}

            {/* Filters */}
            <UserFilters
                searchText={searchText}
                onSearchChange={setSearchText}
                filterRole={filterRole}
                onFilterRoleChange={setFilterRole}
                sortField={sortField}
                onSortFieldChange={setSortField}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                onAddUser={handleAddUser}
            />

            {/* Table */}
            <UserTable
                users={paginatedUsers}
                onEdit={handleEditUser}
                onView={handleViewUser}
                onDelete={handleDeleteUser}
                isLoading={loading}
            />

            {/* Pagination */}
            <UserPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
            />

            {/* Form Modal */}
            <UserForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmitUser}
                initialData={editingUser || viewingUser}
                mode={mode}
            />
        </div>
    );
}





// import React, { useState, useEffect } from "react";
// import { mngUserService } from "../services/mngUserService.js";
// import UserForm from "../components/UserForm.jsx";
// import UserTable from "../components/UserTable.jsx";
// import UserFilters from "../components/UserFilters.jsx";
// import UserPagination from "../components/UserPagination.jsx";
// import Swal from "sweetalert2";

// export default function UserManagement() {
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [editingUser, setEditingUser] = useState(null);
//     const [viewingUser, setViewingUser] = useState(null);
//     const [message, setMessage] = useState("");
//     const [mode, setMode] = useState(""); // 'add', 'edit', 'view'
//     const [userType, setUserType] = useState(""); // thêm để xác định loại user khi thêm

//     // Search/Filter/Sort
//     const [searchText, setSearchText] = useState("");
//     const [filterRole, setFilterRole] = useState("");
//     const [sortField, setSortField] = useState("id");
//     const [sortOrder, setSortOrder] = useState("asc");

//     // Pagination
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 10;

//     const showMessage = (msg) => {
//         setMessage(msg);
//         setTimeout(() => setMessage(""), 3000);
//     };

//     const fetchUsers = async () => {
//         try {
//             setLoading(true);
//             const response = await mngUserService.getAll();
//             if (response.data.code === "1000") {
//                 setUsers(response.data.data);
//                 showMessage("Tải danh sách user thành công");
//             } else {
//                 showMessage("Lỗi khi tải danh sách user");
//             }
//         } catch (error) {
//             console.error("Error fetching users:", error);
//             showMessage("Không thể tải danh sách user");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchUsers();
//     }, []);

//     // 🟩 Thay thế handleAddUser cũ bằng version mới
//     const handleAddUser = async () => {
//         const { value: selectedType } = await Swal.fire({
//             title: "Chọn loại người dùng muốn tạo",
//             input: "select",
//             inputOptions: {
//                 evmStaff: "EVM Staff",
//                 dealerManager: "Dealer Manager",
//                 dealerStaff: "Dealer Staff",
//                 customer: "Customer",
//             },
//             inputPlaceholder: "Chọn loại user",
//             showCancelButton: true,
//             confirmButtonText: "Tiếp tục",
//             cancelButtonText: "Hủy",
//         });

//         if (selectedType) {
//             setUserType(selectedType);
//             setEditingUser(null);
//             setViewingUser(null);
//             setMode("add");
//             setModalOpen(true);
//         }
//     };

//     const handleEditUser = (user) => {
//         setEditingUser(user);
//         setViewingUser(null);
//         setMode("edit");
//         setModalOpen(true);
//     };

//     const handleViewUser = (user) => {
//         setViewingUser(user);
//         setEditingUser(null);
//         setMode("view");
//         setModalOpen(true);
//     };

//     const handleDeleteUser = async (userId) => {
//         const result = await Swal.fire({
//             title: "Bạn có chắc chắn?",
//             text: "Bạn sẽ không thể hoàn tác hành động này!",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#3085d6",
//             cancelButtonColor: "#d33",
//             confirmButtonText: "Có, xóa người dùng!",
//             cancelButtonText: "Hủy",
//         });

//         if (result.isConfirmed) {
//             try {
//                 await mngUserService.delete(userId);
//                 Swal.fire("Đã xóa!", "Người dùng đã được xóa.", "success");
//                 fetchUsers();
//             } catch (error) {
//                 console.error("Error deleting user:", error);
//                 Swal.fire("Lỗi!", "Không thể xóa người dùng.", "error");
//             }
//         }
//     };
//     const handleSubmitUser = async (userData) => {
//         try {
//             let response;
//             switch (userData.role) {
//             case "EVM_STAFF":
//                 response = await mngUserService.createEvmStaff(userData);
//                 break;
//             case "DEALER_MANAGER":
//                 response = await mngUserService.createDealerManager(userData);
//                 break;
//             case "DEALER_STAFF":
//                 response = await mngUserService.createDealerStaff(userData);
//                 break;
//             case "ADMIN":
//                 response = await mngUserService.createAdmin(userData);
//                 break;
//             default:
//                 throw new Error("Vui lòng chọn vai trò hợp lệ");
//             }

//             showMessage("Thêm user thành công");
//             setModalOpen(false);
//             fetchUsers();
//         } catch (error) {
//             Swal.fire({
//             icon: "error",
//             title: "Lỗi!",
//             text: error.response?.data?.message || "Không thể thêm user",
//             });
//         }
//         };


//     // const handleSubmitUser = async (userData) => {
//     //     try {
//     //         if (mode === "edit") {
//     //             await mngUserService.update(editingUser.id, userData);
//     //             showMessage("Cập nhật user thành công");
//     //         } else {
//     //             // Chọn API tương ứng theo loại user
//     //             switch (userType) {
//     //                 case "evmStaff":
//     //                     await mngUserService.createEvmStaff(userData);
//     //                     break;
//     //                 case "dealerManager":
//     //                     await mngUserService.createDealerManager(userData);
//     //                     break;
//     //                 case "dealerStaff":
//     //                     await mngUserService.createDealerStaff(userData);
//     //                     break;
//     //                 case "customer":
//     //                     await mngUserService.createCustomer(userData);
//     //                     break;
//     //                 default:
//     //                     throw new Error("Loại user không hợp lệ");
//     //             }
//     //             showMessage("Thêm user thành công");
//     //         }
//     //         setModalOpen(false);
//     //         fetchUsers();
//     //     } catch (error) {
//     //         console.error("Error saving user:", error);
//     //         Swal.fire({
//     //             icon: "error",
//     //             title: "Oops...",
//     //             text: error.response?.data?.message || "Có lỗi xảy ra",
//     //             confirmButtonText: "OK",
//     //         });
//     //     }
//     // };

// //     // Filter + Search + Sort
// //     const filteredUsers = users
// //         .filter((user) => {
// //             const textMatch =
// //                 user.email.toLowerCase().includes(searchText.toLowerCase()) ||
// //                 user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
// //                 user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
// //                 user.phone?.includes(searchText);

// //             const roleMatch =
// //                 !filterRole || user.roles.some((role) => role.name === filterRole);

// //             return textMatch && roleMatch;
// //         })
// //         .sort((a, b) => {
// //             let aValue = a[sortField];
// //             let bValue = b[sortField];

// //             if (sortField === "createdAt" && aValue) {
// //                 aValue = new Date(aValue);
// //                 bValue = new Date(bValue);
// //             }

// //             if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
// //             if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
// //             return 0;
// //         });

// //     // Pagination
// //     const totalItems = filteredUsers.length;
// //     const totalPages = Math.ceil(totalItems / itemsPerPage);
// //     const paginatedUsers = filteredUsers.slice(
// //         (currentPage - 1) * itemsPerPage,
// //         currentPage * itemsPerPage
// //     );

// //     return (
// //         <div>
// //             <div className="mb-6">
// //                 <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
// //                 <p className="mt-1 text-sm text-gray-600">
// //                     Quản lý và theo dõi tất cả người dùng trong hệ thống
// //                 </p>
// //             </div>

// //             {message && (
// //                 <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
// //                     {message}
// //                 </div>
// //             )}

// //             <UserFilters
// //                 searchText={searchText}
// //                 onSearchChange={setSearchText}
// //                 filterRole={filterRole}
// //                 onFilterRoleChange={setFilterRole}
// //                 sortField={sortField}
// //                 onSortFieldChange={setSortField}
// //                 sortOrder={sortOrder}
// //                 onSortOrderChange={setSortOrder}
// //                 onAddUser={handleAddUser}
// //             />

// //             <UserTable
// //                 users={paginatedUsers}
// //                 onEdit={handleEditUser}
// //                 onView={handleViewUser}
// //                 onDelete={handleDeleteUser}
// //                 isLoading={loading}
// //             />

// //             <UserPagination
// //                 currentPage={currentPage}
// //                 totalPages={totalPages}
// //                 onPageChange={setCurrentPage}
// //                 itemsPerPage={itemsPerPage}
// //                 totalItems={totalItems}
// //             />

// //             <UserForm
// //                 isOpen={modalOpen}
// //                 onClose={() => setModalOpen(false)}
// //                 onSubmit={handleSubmitUser}
// //                 initialData={editingUser || viewingUser}
// //                 mode={mode}
// //                 userType={userType}
// //             />
// //         </div>
// //     );
// // }
