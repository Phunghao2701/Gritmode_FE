import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCheckout } from '../hooks/useCheckout';
import ShippingAddressForm from '../components/ShippingAddressForm';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import OrderSummaryCard from '../components/OrderSummaryCard';
import EmptyState from '../../../shared/components/EmptyState';
import Icon from '../../../shared/components/Icon';

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
    createdOrderId,
    isPayOSModalOpen,
    setIsPayOSModalOpen,
    selectSavedAddress,
    handleChange,
    setPaymentMethod,
    setAppliedVoucher,
    handlePlaceOrder,
  } = useCheckout();

  if (items.length === 0 && !isPayOSModalOpen) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-20">
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
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Top Header & Breadcrumb */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-black dark:hover:text-white transition-colors mb-2"
          >
            <Icon icon="solar:arrow-left-linear" />
            <span>Tiếp tục mua sắm</span>
          </Link>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight">
            Thanh toán đơn hàng
          </h1>
        </div>

        {/* Real SSL / Security Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-bold self-start sm:self-auto">
          <Icon icon="solar:shield-check-bold" className="text-emerald-500 text-base" />
          <span>Bảo mật SSL 256-bit</span>
        </div>
      </div>

      {/* 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Left Column: Shipping & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Shipping Address */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100 dark:border-neutral-900">
              <span className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black font-black text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="font-display font-black text-base uppercase tracking-tight text-black dark:text-white">
                Thông tin giao hàng
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
          </section>

          {/* 2. Payment Method */}
          <section className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-900">
            <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100 dark:border-neutral-900">
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
          </section>

        </div>

        {/* Right Column: Sticky Order Summary (5 cols) */}
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
