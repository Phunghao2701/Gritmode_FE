import React, { useState } from 'react';
import { useProfile, useAddresses } from '../hooks/useProfile';
import ProfileInfoCard from '../components/ProfileInfoCard';
import AddressBook from '../components/AddressBook';
import MyOrdersList from '../components/MyOrdersList';
import ChangePasswordCard from '../components/ChangePasswordCard';
import Icon from '../../../shared/components/Icon';
import useAuth from '../../auth/hooks/useAuth';
import { useAuthStore } from '../../../app/store/authStore';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const user = useAuthStore((state) => state.user);
  const { profile, updateProfile, isUpdating } = useProfile();
  const {
    addresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isLoadingAddresses,
    isCreatingAddress,
    isUpdatingAddress,
    isDeletingAddress,
    isSettingDefaultAddress,
  } = useAddresses();
  const { logout } = useAuth();

  const tabs = [
    { id: 'profile', label: 'Thông tin tài khoản', icon: 'solar:user-linear' },
    { id: 'addresses', label: 'Sổ địa chỉ nhận hàng', icon: 'solar:map-point-linear', count: addresses.length },
    { id: 'orders', label: 'Đơn mua của tôi', icon: 'solar:bag-3-linear' },
    { id: 'security', label: 'Bảo mật & Mật khẩu', icon: 'solar:shield-keyhole-linear' },
  ];

  const currentUser = profile || user || {};
  const initials = (currentUser.full_name || currentUser.fullName || currentUser.email || 'G')
    .trim()
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 min-h-[80vh] animate-fade-in">
      
      {/* 1. Account Summary Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-black flex items-center justify-center font-display font-black text-2xl sm:text-3xl shadow-lg shrink-0">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight">
                {currentUser.full_name || currentUser.fullName || 'Khách hàng Gritmode'}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {currentUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên VIP'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono">
              {currentUser.email}
            </p>
            {currentUser.created_at && (
              <p className="text-[11px] text-neutral-500">
                Thành viên từ: {new Date(currentUser.created_at).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 self-start md:self-auto">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400 hover:text-white px-5 py-2.5 rounded-full border border-rose-500/30 hover:bg-rose-600 transition-all cursor-pointer shadow-sm"
          >
            <Icon icon="solar:logout-2-linear" className="text-base" />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 font-display font-black text-8xl text-white/[0.03] select-none pointer-events-none uppercase">
          GRITMODE
        </div>
      </div>

      {/* 2. Responsive Tabs Bar for Mobile (< lg) */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 select-none scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md font-black'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <Icon icon={tab.icon} className="text-base" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Main 2-Column Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Nav Sidebar (4 cols - Desktop Only) */}
        <div className="hidden lg:block lg:col-span-4 space-y-2 select-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md font-black'
                    : 'bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon icon={tab.icon} className="text-xl shrink-0" />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content Area (8 cols) */}
        <div className="lg:col-span-8">
          {activeTab === 'profile' && (
            <ProfileInfoCard
              profile={currentUser}
              onUpdateProfile={updateProfile}
              isUpdating={isUpdating}
            />
          )}

          {activeTab === 'addresses' && (
            <AddressBook
              addresses={addresses}
              onCreateAddress={createAddress}
              onUpdateAddress={updateAddress}
              onDeleteAddress={deleteAddress}
              onSetDefaultAddress={setDefaultAddress}
              isLoadingAddresses={isLoadingAddresses}
              isCreating={isCreatingAddress}
              isUpdating={isUpdatingAddress}
              isDeleting={isDeletingAddress}
              isSettingDefault={isSettingDefaultAddress}
            />
          )}

          {activeTab === 'orders' && (
            <MyOrdersList />
          )}

          {activeTab === 'security' && (
            <ChangePasswordCard />
          )}
        </div>

      </div>
    </div>
  );
}