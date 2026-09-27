/**
 * AnnouncementTicker — Server Component (0kb client JS)
 * Top announcement marquee ticker for streetwear promotions.
 */
export default function AnnouncementTicker() {
  return (
    <div className="bg-black text-white dark:bg-neutral-950 border-b border-neutral-800 text-[10px] sm:text-[11px] font-black uppercase tracking-widest py-2 overflow-hidden select-none z-50">
      <div className="marquee-track flex items-center gap-12 animate-marquee">
        <span className="flex items-center gap-1.5"><span className="text-emerald-400">⚡</span> MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO MỌI ĐƠN HÀNG</span>
        <span className="text-neutral-500">•</span>
        <span className="flex items-center gap-1.5"><span className="text-amber-400">🔥</span> BỘ SƯU TẬP SIGNATURE STREETWEAR DROP 2026</span>
        <span className="text-neutral-500">•</span>
        <span className="flex items-center gap-1.5"><span>🛡️</span> 100% PREMIUM HEAVYWEIGHT COTTON 280GSM</span>
        <span className="text-neutral-500">•</span>
        <span className="flex items-center gap-1.5"><span className="text-blue-400">🔄</span> ĐỔI TRẢ THOẢI MÁI TRONG VÒNG 7 NGÀY</span>
        <span className="text-neutral-500">•</span>
        <span className="flex items-center gap-1.5"><span className="text-emerald-400">⚡</span> MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO MỌI ĐƠN HÀNG</span>
        <span className="text-neutral-500">•</span>
        <span className="flex items-center gap-1.5"><span className="text-amber-400">🔥</span> BỘ SƯU TẬP SIGNATURE STREETWEAR DROP 2026</span>
        <span className="text-neutral-500">•</span>
        <span className="flex items-center gap-1.5"><span>🛡️</span> 100% PREMIUM HEAVYWEIGHT COTTON 280GSM</span>
        <span className="text-neutral-500">•</span>
        <span className="flex items-center gap-1.5"><span className="text-blue-400">🔄</span> ĐỔI TRẢ THOẢI MÁI TRONG VÒNG 7 NGÀY</span>
      </div>
    </div>
  );
}
