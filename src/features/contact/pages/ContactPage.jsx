import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import InputField from '../../../shared/components/InputField';
import { toast } from '../../../shared/utils/toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    topic: 'order_support',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setIsSubmitting(true);
    // Simulate sending message to Gritmode Support
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Tin nhắn của bạn đã được gửi thành công! Đội ngũ Gritmode sẽ phản hồi sớm nhất.');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        topic: 'order_support',
        message: '',
      });
    }, 800);
  };

  const stores = [
    {
      city: 'TP. HỒ CHÍ MINH',
      name: 'Flagship Store Saigon',
      address: '42 Tôn Thất Thiệp, Phường Bến Nghé, Quận 1, TP. HCM',
      phone: '0901 234 567',
      hours: '09:30 – 21:30 (Tất cả các ngày trong tuần)',
      tag: 'FLAGSHIP STORE',
    },
    {
      city: 'HÀ NỘI',
      name: 'Concept Store Hanoi',
      address: '12 Đặng Thái Thân, Phường Phan Chu Trinh, Quận Hoàn Kiếm, Hà Nội',
      phone: '0908 765 432',
      hours: '10:00 – 21:30 (Tất cả các ngày trong tuần)',
      tag: 'CONCEPT STORE',
    },
  ];

  const faqs = [
    {
      q: 'Chính sách đổi trả sản phẩm của Gritmode như thế nào?',
      a: 'Gritmode hỗ trợ đổi size hoặc đổi mẫu trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tem mác, chưa qua sử dụng hoặc giặt tẩy.',
    },
    {
      q: 'Thời gian giao hàng tiêu chuẩn là bao lâu?',
      a: 'Đơn hàng nội thành TP. HCM và Hà Nội thường được giao trong 1 - 2 ngày làm việc. Các tỉnh thành khác trên toàn quốc từ 2 - 4 ngày làm việc.',
    },
    {
      q: 'Chất liệu vải áo thun và hoodie của Gritmode có gì đặc biệt?',
      a: '100% sản phẩm sử dụng vải Premium Heavyweight Cotton định lượng từ 280GSM đến 380GSM, xử lý chải kỹ chống xù lông, bo cổ dệt kép giữ form cực tốt qua hàng trăm lần giặt.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
            <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-black dark:text-white">Liên hệ</span>
          </div>

          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400 block">
            Connect with Gritmode
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-black dark:text-white">
            Liên hệ & Trải nghiệm
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
            Đội ngũ Gritmode luôn sẵn sàng lắng nghe câu chuyện, hỗ trợ xử lý đơn hàng và đón tiếp bạn tại các không gian trải nghiệm thời trang streetwear trực tiếp.
          </p>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        
        {/* 2. Main 2-Column Grid: Left (Store info & Channels) / Right (Message Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* LEFT: Showroom & Direct Contact Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Store Locations */}
            <div className="space-y-4">
              <h2 className="font-display font-black text-base uppercase tracking-tight flex items-center gap-2">
                <Icon icon="solar:shop-2-bold" className="text-lg" />
                <span>Hệ thống Store trực tiếp</span>
              </h2>

              <div className="space-y-3">
                {stores.map((s, idx) => (
                  <div 
                    key={idx}
                    className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2.5 transition-all hover:border-neutral-400"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-black text-xs uppercase tracking-tight text-black dark:text-white">
                        {s.name}
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
                        {s.city}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {s.address}
                    </p>
                    <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Icon icon="solar:clock-circle-linear" />
                        <span>{s.hours}</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-mono">
                        <Icon icon="solar:phone-linear" />
                        <span>{s.phone}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Online Support Channels */}
            <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
              <h3 className="font-display font-black text-sm uppercase tracking-tight">
                Kênh hỗ trợ trực tuyến
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Hotline CSKH:</span>
                  <a href="tel:0901234567" className="font-bold font-mono hover:underline">
                    0901 234 567
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Email phản hồi & Đơn hàng:</span>
                  <a href="mailto:support@gritmode.com" className="font-bold hover:underline">
                    support@gritmode.com
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Hợp tác truyền thông & B2B:</span>
                  <a href="mailto:media@gritmode.com" className="font-bold hover:underline">
                    media@gritmode.com
                  </a>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center gap-2">
                {[
                  { name: 'Instagram', icon: 'solar:camera-linear', href: 'https://instagram.com' },
                  { name: 'Facebook', icon: 'solar:like-linear', href: 'https://facebook.com' },
                  { name: 'TikTok', icon: 'solar:play-circle-linear', href: 'https://tiktok.com' },
                ].map((soc, idx) => (
                  <a
                    key={idx}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center text-xs font-black uppercase tracking-wider hover:border-neutral-400 dark:hover:border-neutral-500 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Icon icon={soc.icon} />
                    <span>{soc.name}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Send Message Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                Direct Message
              </span>
              <h2 className="font-display font-black text-xl uppercase tracking-tight text-black dark:text-white">
                Gửi tin nhắn cho Gritmode
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Điền thông tin và yêu cầu của bạn, chúng tôi sẽ liên hệ phản hồi trong vòng 24 giờ làm việc.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mx-auto">
                  <Icon icon="solar:check-circle-bold" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-black text-base uppercase">Gửi tin nhắn thành công!</h3>
                  <p className="text-xs text-neutral-400">
                    Cảm ơn bạn đã liên hệ với Gritmode. Đội ngũ CSKH sẽ kiểm tra và phản hồi qua email hoặc số điện thoại của bạn.
                  </p>
                </div>
                <PrimaryButton
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 text-xs font-black uppercase"
                >
                  Gửi tin nhắn khác
                </PrimaryButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Họ và tên"
                    name="fullName"
                    placeholder=""
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="mb-0"
                  />
                  <InputField
                    label="Số điện thoại"
                    name="phone"
                    type="tel"
                    placeholder=""
                    value={formData.phone}
                    onChange={handleChange}
                    className="mb-0"
                  />
                </div>

                <InputField
                  label="Địa chỉ Email"
                  name="email"
                  type="email"
                  placeholder=""
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mb-0"
                />

                {/* Topic Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white">
                    Chủ đề cần hỗ trợ *
                  </label>
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer"
                  >
                    <option value="order_support">Hỗ trợ thông tin & Đổi trả đơn hàng</option>
                    <option value="size_advice">Tư vấn chọn size & Phom dáng thiết kế</option>
                    <option value="product_feedback">Đóng góp ý kiến về chất lượng sản phẩm</option>
                    <option value="partnership">Hợp tác kinh doanh, phân phối & Media</option>
                    <option value="other">Chủ đề khác</option>
                  </select>
                </div>

                {/* Message Content */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white">
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder=""
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all"
                  />
                </div>

                <PrimaryButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full justify-center py-4 uppercase tracking-widest text-xs font-black rounded-2xl shadow-xl mt-2"
                >
                  Gửi yêu cầu hỗ trợ
                </PrimaryButton>
              </form>
            )}
          </div>

        </div>

        {/* 3. FAQ Section */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Frequently Asked Questions
            </span>
            <h2 className="font-display font-black text-2xl uppercase tracking-tight">
              Câu hỏi thường gặp
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqs.map((f, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2.5"
              >
                <h3 className="font-black text-xs uppercase tracking-tight text-black dark:text-white leading-relaxed">
                  {f.q}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
