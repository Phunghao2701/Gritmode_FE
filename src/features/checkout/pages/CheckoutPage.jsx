import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../hooks/useCheckout';
import ShippingAddressForm from '../components/ShippingAddressForm';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import OrderSummaryCard from '../components/OrderSummaryCard';
import EmptyState from '../../../shared/components/EmptyState';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    formData,
    errors,
    paymentMethod,
    appliedVoucher,
    subtotal,
    shippingFee,
    discountAmount,
    finalAmount,
    isLoading,
    addresses,
    isAuthenticated,
    selectSavedAddress,
    handleChange,
    setPaymentMethod,
    setAppliedVoucher,
    handlePlaceOrder,
  } = useCheckout();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState
          title="Giỏ hàng trống"
          description="Bạn chưa chọn sản phẩm nào để thanh toán. Hãy chọn những mẫu thiết kế streetwear ưng ý!"
          icon="solar:bag-smile-linear"
          actionLabel="Khám phá sản phẩm"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-900 pb-4">
        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
          Secure Checkout
        </span>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight mt-1">
          Thông tin thanh toán & Giao hàng
        </h1>
      </div>

      {/* 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Shipping & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Shipping Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black font-black text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="font-display font-black text-base uppercase tracking-tight text-black dark:text-white">
                Địa chỉ nhận hàng
              </h2>
            </div>

            <ShippingAddressForm
              formData={formData}
              onChange={handleChange}
              errors={errors}
              addresses={addresses}
              onSelectSavedAddress={selectSavedAddress}
              selectedAddressId={formData.selectedAddressId}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* 2. Payment Method */}
          <div className="space-y-4 pt-6 border-t border-neutral-100 dark:border-neutral-900">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black font-black text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="font-display font-black text-base uppercase tracking-tight text-black dark:text-white">
                Phương thức thanh toán
              </h2>
            </div>

            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
            />
          </div>

        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28">
            <OrderSummaryCard
              items={items}
              subtotal={subtotal}
              shippingFee={shippingFee}
              discountAmount={discountAmount}
              finalAmount={finalAmount}
              appliedVoucher={appliedVoucher}
              onApplyVoucher={setAppliedVoucher}
              onRemoveVoucher={() => setAppliedVoucher(null)}
              onSubmitOrder={handlePlaceOrder}
              isLoading={isLoading}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
