export default function OutOfStockOverlay() {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px] pointer-events-none"
      aria-label="Sản phẩm tạm hết hàng"
    >
      <span className="rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-widest text-black shadow-2xl">
        Tạm hết hàng
      </span>
    </div>
  );
}
