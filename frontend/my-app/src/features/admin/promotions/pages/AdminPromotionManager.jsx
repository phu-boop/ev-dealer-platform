// features/admin/promotions/AdminPromotionManager.js
import React, { useState } from 'react';
import PromotionListPage from './PromotionListPage';
import PromotionCreatePage from './PromotionCreatePage';
import PromotionEditPage from './PromotionEditPage';

const AdminPromotionManager = () => {
  const [currentPage, setCurrentPage] = useState('list');
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const handleCreatePromotion = () => {
    setCurrentPage('create');
  };

  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setCurrentPage('edit');
  };

  const handleBackToList = () => {
    setCurrentPage('list');
    setSelectedPromotion(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'create':
        return <PromotionCreatePage onBack={handleBackToList} />;
      case 'edit':
        return <PromotionEditPage promotion={selectedPromotion} onBack={handleBackToList} />;
      default:
        return <PromotionListPage onCreate={handleCreatePromotion} onEdit={handleEditPromotion} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin - Quản lý Khuyến mãi</h1>
              <p className="text-sm text-gray-600 mt-1">Quản lý và phê duyệt tất cả khuyến mãi</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

export default AdminPromotionManager;