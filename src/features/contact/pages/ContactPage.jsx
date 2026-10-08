/* global process */
"use client";
import React, { useState } from "react";
import Icon from "../../../shared/components/Icon";
import PrimaryButton from "../../../shared/components/Button/PrimaryButton";
import InputField from "../../../shared/components/InputField";
import Breadcrumb from "../../../shared/components/Breadcrumb";
import { toast } from "../../../shared/utils/toast";
import { submitContactMessage } from "../apis/contact.api";

const SOCIAL_CHANNELS = [
  {
    name: "Instagram",
    icon: "solar:camera-linear",
    href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL,
  },
  {
    name: "Facebook",
    icon: "solar:like-linear",
    href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL,
  },
  {
    name: "TikTok",
    icon: "solar:play-circle-linear",
    href: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_URL,
  },
].filter((social) => social.href);

const CONTACT_FORM_INITIAL_STATE = {
  fullName: "",
  email: "",
  phone: "",
  topic: "order_support",
  message: "",
};

export default function ContactPage() {
  const [formData, setFormData] = useState(CONTACT_FORM_INITIAL_STATE);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContactMessage({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        topic: formData.topic,
        message: formData.message.trim(),
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(
        "Tin nhắn của bạn đã được gửi thành công! Đội ngũ Gritmode sẽ phản hồi sớm nhất.",
      );
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        topic: "order_support",
        message: "",
      });
    } catch (error) {
      setIsSubmitting(false);
      toast.error(
        error?.response?.data?.message ||
          "Không thể gửi tin nhắn lúc này. Vui lòng thử lại.",
      );
    }
  };

  const stores = [
    {
      city: "TP. HỒ CHÍ MINH",
      name: "Gritmode Online Store",
      phone: "0326 747 206",
      hours: "09:30 – 22:00 (Hàng ngày)",
      tag: "ONLINE STORE",
    },
  ];

  const faqs = [
    {
      q: "Đổi trả sản phẩm như thế nào?",
      a: "Hỗ trợ đổi size hoặc mẫu trong 7 ngày khi sản phẩm còn nguyên tem mác và chưa qua sử dụng.",
    },
    {
      q: "Bao lâu nhận được hàng?",
      a: "TPHCM và miền Nam: 1–3 ngày làm việc. Miền Trung và miền Bắc: 3–5 ngày làm việc.",
    },
    {
      q: "Vải Gritmode có gì đặc biệt?",
      a: "Premium Heavyweight Cotton 280–380GSM, giữ form tốt và phù hợp với phong cách streetwear.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white animate-fade-in">
      {/* 1. Header Banner */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Liên hệ", current: true },
            ]}
          />

          <h1 className="font-sans font-[550] text-2xl sm:text-3xl lg:text-4xl uppercase tracking-widest text-black dark:text-white">
            Liên hệ & Trải nghiệm
          </h1>
          <p className="text-xs sm:text-sm font-normal text-neutral-500 max-w-2xl leading-relaxed">
            Cần hỗ trợ về đơn hàng, sản phẩm hoặc size? Gritmode luôn sẵn sàng
            lắng nghe.
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
              <h2 className="font-sans font-[550] text-xl uppercase tracking-widest flex items-center gap-2">
                <Icon icon="solar:shop-2-bold" className="text-lg" />
                <span>Hệ thống Store</span>
              </h2>

              <div className="space-y-3">
                {stores.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2.5 transition-all hover:border-neutral-400"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-[550] text-xs uppercase tracking-widest text-black dark:text-white">
                        {s.name}
                      </h3>
                      <span className="text-[10px] font-[550] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
                        {s.city}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      Mua sắm trực tuyến toàn quốc.
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
              <h3 className="font-sans font-[550] text-xs uppercase tracking-widest">
                Kênh hỗ trợ trực tuyến
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Hotline CSKH:</span>
                  <a
                    href="tel:0326747206"
                    className="font-bold font-mono hover:underline"
                  >
                    0326 747 206
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Email đơn hàng:</span>
                  <a
                    href="mailto:support.gritmode@gmail.com"
                    className="font-bold hover:underline"
                  >
                    support.gritmode@gmail.com
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Hợp tác:</span>
                  <a
                    href="mailto:gritmode.stu@gmail.com"
                    className="font-bold hover:underline"
                  >
                    gritmode.stu@gmail.com
                  </a>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SOCIAL_CHANNELS.map((soc) => (
                  <a
                    key={soc.href}
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
              <h2 className="font-sans font-[550] text-xl sm:text-2xl uppercase tracking-widest text-black dark:text-white">
                Gửi tin nhắn cho Gritmode
              </h2>
              <p className="text-xs sm:text-sm font-normal text-neutral-500 mt-1 leading-relaxed">
                Điền thông tin, Gritmode sẽ phản hồi trong vòng 24 giờ làm việc.
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-8 border-y border-neutral-200 dark:border-neutral-800 text-center space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mx-auto">
                  <Icon icon="solar:check-circle-bold" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-[550] text-base normal-case tracking-normal">
                    Tin nhắn đã được gửi
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Cảm ơn bạn đã liên hệ. Gritmode sẽ phản hồi qua email hoặc
                    số điện thoại.
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
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="mb-0"
                  />
                  <InputField
                    label="Số điện thoại"
                    name="phone"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mb-0"
                  />
                </div>

                <InputField
                  label="Địa chỉ Email"
                  name="email"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mb-0"
                />

                {/* Topic Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                    Chủ đề cần hỗ trợ{" "}
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs sm:text-sm font-medium text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer"
                  >
                    <option value="order_support">
                      Hỗ trợ thông tin & Đổi trả đơn hàng
                    </option>
                    <option value="size_advice">
                      Tư vấn chọn size & Form dáng thiết kế
                    </option>
                    <option value="product_feedback">
                      Đóng góp ý kiến về chất lượng sản phẩm
                    </option>
                    <option value="partnership">
                      Hợp tác kinh doanh, phân phối & Media
                    </option>
                    <option value="other">Chủ đề khác</option>
                  </select>
                </div>

                {/* Message Content */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                    Nội dung tin nhắn{" "}
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Bạn cần Gritmode hỗ trợ điều gì?"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs sm:text-sm font-medium text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all"
                  />
                </div>

                <PrimaryButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full justify-center py-4 uppercase tracking-widest text-xs font-[550] rounded-xl shadow-xl mt-2"
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
            <h2 className="font-sans font-[550] text-xl sm:text-2xl uppercase tracking-widest">
              CÂU HỎI THƯỜNG GẶP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-neutral-200 dark:border-neutral-800">
            {faqs.map((f, idx) => (
              <div
                key={idx}
                className="py-6 md:px-6 space-y-2.5 border-b md:border-b-0 md:border-r last:border-b-0 md:last:border-r-0 border-neutral-200 dark:border-neutral-800"
              >
                <h3 className="font-[550] text-sm uppercase tracking-wide text-black dark:text-white leading-relaxed">
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
