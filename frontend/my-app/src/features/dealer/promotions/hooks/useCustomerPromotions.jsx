// features/customer/promotions/hooks/useCustomerPromotions.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { customerPromotionService } from '../services/apiConstSaleService';

export const useCustomerPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, UPCOMING
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerPromotionService.getAllPromotions();
      setPromotions(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Lỗi khi tải danh sách khuyến mãi';
      setError(errorMessage);
      console.error('Promotion loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter promotions based on current filter
  const filteredPromotions = useMemo(() => {
    if (filter === 'ALL') {
      return promotions.filter(p => p.status === 'ACTIVE' || p.status === 'UPCOMING');
    }
    return promotions.filter(p => p.status === filter);
  }, [promotions, filter]);

  // Get promotions sorted by relevance (active first, then upcoming)
  const sortedPromotions = useMemo(() => {
    return [...filteredPromotions].sort((a, b) => {
      // Active promotions first
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      
      // Then sort by start date (soonest first)
      return new Date(a.startDate) - new Date(b.startDate);
    });
  }, [filteredPromotions]);

  // Get active promotions count
  const activePromotionsCount = useMemo(() => {
    return promotions.filter(p => p.status === 'ACTIVE').length;
  }, [promotions]);

  // Get upcoming promotions count
  const upcomingPromotionsCount = useMemo(() => {
    return promotions.filter(p => p.status === 'UPCOMING').length;
  }, [promotions]);

  // Get expiring soon promotions (ending in next 3 days)
  const expiringSoonPromotions = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return promotions.filter(promotion => {
      if (promotion.status !== 'ACTIVE') return false;
      
      const endDate = new Date(promotion.endDate);
      return endDate > now && endDate <= threeDaysFromNow;
    });
  }, [promotions]);

  // Get starting soon promotions (starting in next 3 days)
  const startingSoonPromotions = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return promotions.filter(promotion => {
      if (promotion.status !== 'UPCOMING') return false;
      
      const startDate = new Date(promotion.startDate);
      return startDate > now && startDate <= threeDaysFromNow;
    });
  }, [promotions]);

  // Get promotion by ID
  const getPromotionById = useCallback((id) => {
    return promotions.find(p => p.promotionId === id);
  }, [promotions]);

  // Auto-refresh promotions every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadPromotions();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loading, loadPromotions]);

  // Load promotions on component mount
  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  // Retry function with exponential backoff
  const retryWithBackoff = useCallback(async (maxRetries = 3) => {
    let retries = 0;
    
    const attemptLoad = async () => {
      try {
        await loadPromotions();
        return true;
      } catch (err) {
        retries++;
        if (retries < maxRetries) {
          const delay = Math.pow(2, retries) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptLoad();
        }
        throw err;
      }
    };

    return attemptLoad();
  }, [loadPromotions]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set filter with validation
  const setFilterWithValidation = useCallback((newFilter) => {
    const validFilters = ['ALL', 'ACTIVE', 'UPCOMING'];
    if (validFilters.includes(newFilter)) {
      setFilter(newFilter);
    }
  }, []);

  return {
    // Data
    promotions: sortedPromotions,
    allPromotions: promotions,
    filteredPromotions: sortedPromotions,
    
    // Counts and stats
    activePromotionsCount,
    upcomingPromotionsCount,
    expiringSoonPromotions,
    startingSoonPromotions,
    totalCount: filteredPromotions.length,
    
    // State
    loading,
    error,
    filter,
    lastUpdated,
    
    // Actions
    setFilter: setFilterWithValidation,
    refresh: loadPromotions,
    retry: retryWithBackoff,
    clearError,
    getPromotionById,
    
    // Status flags
    hasPromotions: promotions.length > 0,
    hasActivePromotions: activePromotionsCount > 0,
    hasUpcomingPromotions: upcomingPromotionsCount > 0,
    hasExpiringSoon: expiringSoonPromotions.length > 0,
    hasStartingSoon: startingSoonPromotions.length > 0,
  };
};

export default useCustomerPromotions;