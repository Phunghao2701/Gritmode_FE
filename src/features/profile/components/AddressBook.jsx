import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import AddressModal from './AddressModal';

export default function AddressBook({
  addresses = [],
  onCreateAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  isCreating,
  isUpdating,
  isDeleting,
  isSettingDefault,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAddress(null);
  };

  const handleFormSubmit = async (payload) => {
    if (editingAddress) {
      await onUpdateAddress(editingAddress.user_address_id, payload);
    } else {
      await onCreateAddress(payload);
    }
    handleCloseModal();
  };

  const handleConfirmDelete = (id) => {
    onDeleteAddress(id);
    setDeletingId(null);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h3 className="font-display font-black text-xl text-black dark:text-white uppercase tracking-tight">
            Sổ địa chỉ nhận hàng
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Quản lý và thiết lập địa chỉ nhận hàng mặc định cho các đơn mua
          </p>
        </div>
        <PrimaryButton
          onClick={handleOpenCreate}
          size="sm"
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Icon icon="solar:add-circle-linear" className="text-base" />
          <span>Thêm địa chỉ mới</span>
        </PrimaryButton>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto text-2xl">
            <Icon icon="solar:map-point-linear" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-black dark:text-white">Bạn chưa lưu địa chỉ nào</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Thêm địa chỉ giao hàng để thuận tiện hơn khi thanh toán các sản phẩm thời trang tại Gritmode.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="text-xs font-black uppercase tracking-wider text-black dark:text-white hover:underline cursor-pointer"
          >
            + Thêm địa chỉ đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const id = addr.user_address_id;
            const isDefault = Boolean(addr.is_default);
            const fullLocation = [
              addr.address_line_user_address,
              addr.ward_user_address,
              addr.district_user_address,
              addr.province_user_address,
            ]
              .filter(Boolean)
              .join(', ');

            return (
              <div
                key={id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative ${
                  isDefault
                    ? 'border-black dark:border-white bg-neutral-50/40 dark:bg-neutral-800/40 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="space-y-2">
                  {/* Name + Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-black dark:text-white">
                        {addr.receiver_name_user_address}
                      </span>
                      {isDefault && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full">
                          <Icon icon="solar:check-circle-bold" className="text-xs" />
                          Mặc định
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-semibold text-neutral-500">
                      {addr.phone_user_address}
                    </span>
                  </div>

                  {/* Address Line */}
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {fullLocation}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                  <div>
                    {!isDefault && (
                      <button
                        onClick={() => onSetDefaultAddress(id)}
                        disabled={isSettingDefault}
                        className="font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Đặt làm mặc định
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenEdit(addr)}
                      className="font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Icon icon="solar:pen-linear" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => setDeletingId(id)}
                      className="font-bold text-neutral-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Icon icon="solar:trash-bin-minimalistic-linear" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>

                {/* Inline Delete Confirmation Dialog */}
                {deletingId === id && (
                  <div className="absolute inset-0 bg-white/95 dark:bg-neutral-900/95 rounded-2xl p-5 flex flex-col justify-center items-center text-center space-y-3 z-10 animate-fade-in border border-rose-200 dark:border-rose-900">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Bạn có chắc chắn muốn xóa địa chỉ này?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleConfirmDelete(id)}
                        disabled={isDeleting}
                        className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit */}
      <AddressModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        editingAddress={editingAddress}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
