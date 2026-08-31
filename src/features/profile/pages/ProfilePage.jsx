import React, { useState } from 'react';
import { useProfile, useAddresses, useMyOrders } from '../hooks/useProfile';
import ProfileInfoCard from '../components/ProfileInfoCard';
import AddressBook from '../components/AddressBook';
import MyOrdersList from '../components/MyOrdersList';
import Icon from '../../../shared/components/Icon';
import useAuth from '../../auth/hooks/useAuth';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
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
  const { orders } = useMyOrders();
  const { logout } = useAuth();

  const tabs = [
    { id: 'profile', label: 'Thông tin tài khoản', icon: 'solar:user-linear' },
    { id: 'addresses', label: 'Sổ địa chỉ nhận hàng', icon: 'solar:map-point-linear' },
    { id: 'orders', label: 'Đơn mua của tôi', icon: 'solar:bag-3-linear' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[75vh]">
      {/* Top Banner */}
      <div className="border-b border-neutral-100 dark:border-neutral-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
            Account Management
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight mt-1">
            Trung tâm tài khoản khách hàng
          </h1>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 px-4 py-2 rounded-full border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Icon icon="solar:logout-2-linear" />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* Main 2-Column Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Nav Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3.5 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-black'
                    : 'bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <Icon icon={tab.icon} className="text-lg shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area (8 cols) */}
        <div className="lg:col-span-8">
          {activeTab === 'profile' && (
            <ProfileInfoCard
              profile={profile}
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
            <MyOrdersList orders={orders} />
          )}
        </div>

      </div>
    </div>
  );
}