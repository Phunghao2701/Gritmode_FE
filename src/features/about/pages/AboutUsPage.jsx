import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';

export default function AboutUsPage() {
  const values = [
    {
      icon: 'solar:shield-star-bold',
      title: 'Chất liệu nguyên bản (Raw & Heavyweight)',
      desc: 'Chúng tôi sử dụng 100% sợi bông Cotton chải kỹ tự nhiên với định lượng từ 280GSM đến 380GSM. Từng mét vải đều trải qua quy trình xử lý tiền co rút nghiêm ngặt nhằm duy trì form dáng boxy hoàn hảo qua hàng trăm lần giặt.',
    },
    {
      icon: 'solar:scissors-square-bold',
      title: 'Kỹ thuật may thủ công chần kép (Reinforced Seams)',
      desc: 'Tập trung tuyệt đối vào cấu trúc may 2 kim gia cố ở nách áo, vai và bo cổ dệt kép co giãn chống bai dão. Từng đường kim mũi chỉ là lời khẳng định về độ bền bỉ cùng thời gian.',
    },
    {
      icon: 'solar:flag-bold',
      title: 'Tự hào tay nghề thợ may Việt Nam (Made in Vietnam)',
      desc: 'Gritmode tôn vinh và đồng hành cùng các xưởng dệt may lâu năm tại Việt Nam. Toàn bộ khâu dệt, nhuộm, cắt may và in lụa thủ công plastisol đều được thực hiện bởi đôi bàn tay khéo léo của người thợ Việt.',
    },
    {
      icon: 'solar:fire-bold',
      title: 'Tinh thần không thỏa hiệp (The Grit Ethos)',
      desc: 'Không chạy theo xu hướng chớp nhoáng (fast-fashion). Mỗi thiết kế được phát hành theo dạng Limited Drop — vừa là sản phẩm thời trang, vừa là một bản tuyên ngôn nghệ thuật đường phố độc lập.',
    },
  ];

  const milestones = [
    {
      year: '2024',
      title: 'Khởi đầu từ xưởng may nhỏ tại Sài Gòn',
      desc: 'Thành lập với khát khao tạo ra dòng áo thun Heavyweight Cotton 280GSM chuẩn quốc tế ngay tại Việt Nam.',
    },
    {
      year: '2025',
      title: 'Mở rộng bộ sưu tập & Flagship Store',
      desc: 'Ra mắt các dòng sản phẩm Signature Hoodie 380GSM, Quần Cargo đa túi và chính thức khai trương Flagship Store đầu tiên tại Quận 1, TP. HCM.',
    },
    {
      year: '2026',
      title: 'Hệ sinh thái thời trang Streetwear đương đại',
      desc: 'Phát triển nền tảng mua sắm kỹ thuật số mượt mà, kết nối cộng đồng streetwear trên toàn quốc và hướng tới xuất khẩu khu vực.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white animate-fade-in">
      
      {/* 1. Hero Section */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 py-16 sm:py-24">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[11px] font-black uppercase tracking-widest">
            <span>GRITMODE® MANIFESTO</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-black dark:text-white max-w-4xl mx-auto leading-tight">
            Định hình bản lĩnh đường phố từ chất liệu nguyên bản
          </h1>

          <p className="text-sm sm:text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Gritmode không chỉ tạo ra quần áo — chúng tôi đại diện cho thái độ sống kiên định (*Grit*), bền bỉ và không thỏa hiệp trước sự hào nhoáng tạm thời.
          </p>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20">
        
        {/* 2. Story / Manifesto Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400 block">
              OUR PHILOSOPHY
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight leading-snug">
              "Thời trang thực sự bắt đầu khi sự bền bỉ gặp gỡ tính duy mỹ."
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
              <p>
                Sinh ra tại mảnh đất Sài Gòn đầy năng lượng và cá tính, Gritmode ra đời từ niềm đam mê thuần khiết dành cho văn hóa Streetwear nguyên bản. Chúng tôi từng tự hỏi: Tại sao giới trẻ Việt Nam phải tìm kiếm những chiếc áo thun định lượng nặng từ nước ngoài với mức giá đắt đỏ, trong khi Việt Nam chính là một trong những cái nôi may mặc hàng đầu thế giới?
              </p>
              <p>
                Đó là lý do Gritmode ra đời — bắt đầu từ việc tự nghiên cứu tỉ lệ dệt sợi cotton, tinh chỉnh form áo rộng rãi (*Oversized Boxy Fit*) phù hợp với vóc dáng người Việt, đến việc lựa chọn công nghệ in lụa thủ công bền màu nhất.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 p-8 sm:p-12 rounded-3xl bg-neutral-900 text-white space-y-6 relative overflow-hidden border border-neutral-800">
            <div className="relative z-10 space-y-4">
              <span className="text-4xl font-display font-black text-neutral-500">
                280<span className="text-xl">GSM+</span>
              </span>
              <h3 className="font-display font-black text-xl uppercase">
                Tiêu chuẩn Heavyweight Cotton đỉnh cao
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Độ dày dặn mang lại cảm giác an tâm khi mặc, đứng phom và không ôm sát, giúp người mặc luôn tự tin trong mọi chuyển động đường phố.
              </p>
            </div>
            
            {/* Background Aesthetic Watermark */}
            <div className="absolute right-2 bottom-2 text-8xl font-black text-white/5 select-none pointer-events-none font-display">
              GRIT
            </div>
          </div>
        </div>

        {/* 3. Core Values Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              CORE PILLARS
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
              4 Trụ Cột Giá Trị Của Gritmode
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 transition-all hover:border-neutral-400"
              >
                <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xl">
                  <Icon icon={v.icon} />
                </div>
                <h3 className="font-display font-black text-base uppercase tracking-tight text-black dark:text-white">
                  {v.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Journey Timeline */}
        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-8">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              THE JOURNEY
            </span>
            <h2 className="font-display font-black text-2xl uppercase tracking-tight">
              Hành Trình Kiến Tạo Thương Hiệu
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {milestones.map((m, idx) => (
              <div key={idx} className="space-y-2 border-l-2 border-black dark:border-white pl-4">
                <span className="font-display font-black text-2xl text-black dark:text-white">
                  {m.year}
                </span>
                <h3 className="font-black text-xs uppercase tracking-tight text-black dark:text-white">
                  {m.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Bottom CTA Banner */}
        <div className="p-10 sm:p-16 rounded-3xl bg-black text-white text-center space-y-6">
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
            JOIN THE CULTURE
          </span>
          <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight max-w-2xl mx-auto">
            Khám phá những thiết kế Streetwear mới nhất
          </h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            Mỗi sản phẩm là một câu chuyện độc bản. Hãy trải nghiệm chất lượng vải và form dáng nguyên bản của Gritmode ngay hôm nay.
          </p>
          <div className="pt-2">
            <Link to="/products">
              <PrimaryButton
                variant="secondary"
                className="px-8 py-3.5 uppercase tracking-widest text-xs font-black rounded-full"
              >
                Khám phá Bộ sưu tập
              </PrimaryButton>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
