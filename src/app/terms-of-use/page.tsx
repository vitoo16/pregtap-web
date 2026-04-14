import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng (EULA) - PregTap',
  description:
    'Điều khoản sử dụng và Thỏa thuận Cấp phép Người dùng Cuối (EULA) của PregTap. Vui lòng đọc kỹ trước khi sử dụng ứng dụng.',
};

const LAST_UPDATED = '14 tháng 4, 2026';

export default function TermsOfUsePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FFEBEE 0%, #FFF3E0 100%)',
        fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,150,144,0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 24px',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/splash_logo_embedded.png" alt="PregTap" style={{ height: 40, width: 'auto' }} />
            <img src="/pregtap_logo.png" alt="PregTap" style={{ height: 28, width: 'auto' }} />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Hero card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #B8E6D4 0%, #8FD4BC 100%)',
            borderRadius: 24,
            padding: '40px 36px',
            marginBottom: 32,
            color: '#1B4332',
            boxShadow: '0 8px 24px rgba(143,212,188,0.35)',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📜</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1.2, color: '#1B4332' }}>
            Điều khoản sử dụng
          </h1>
          <p
            style={{
              marginTop: 10,
              fontSize: 15,
              lineHeight: 1.6,
              color: '#2D6A4F',
            }}
          >
            Thỏa thuận Cấp phép Người dùng Cuối (EULA) — Vui lòng đọc kỹ trước khi sử dụng ứng dụng PregTap.
            Việc cài đặt hoặc sử dụng ứng dụng đồng nghĩa với việc bạn chấp nhận các điều khoản này.
          </p>
          <div
            style={{
              marginTop: 16,
              display: 'inline-block',
              background: 'rgba(255,255,255,0.35)',
              borderRadius: 999,
              padding: '4px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#1B4332',
            }}
          >
            Cập nhật lần cuối: {LAST_UPDATED}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Section title="1. Chấp nhận điều khoản" icon="✅">
            <p>
              Bằng cách tải xuống, cài đặt hoặc sử dụng ứng dụng PregTap (&quot;Ứng dụng&quot;), bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản sử dụng này. Nếu bạn không đồng ý, vui lòng không sử dụng Ứng dụng.
            </p>
          </Section>

          <Section title="2. Mô tả dịch vụ" icon="📱">
            <p>
              PregTap là ứng dụng di động hỗ trợ theo dõi thai kỳ toàn diện, bao gồm:
            </p>
            <ul>
              <li>Theo dõi sự phát triển thai nhi và cân nặng mẹ bầu.</li>
              <li>Lập kế hoạch dinh dưỡng và thực đơn cá nhân hóa.</li>
              <li>Số hóa và lưu trữ hồ sơ y tế, kết quả siêu âm.</li>
              <li>Theo dõi cảm xúc và nhật ký thai kỳ.</li>
              <li>Nhắc lịch khám thai và uống vitamin.</li>
            </ul>
            <p>
              Nội dung trong ứng dụng chỉ mang tính chất thông tin và hỗ trợ — <strong>không thay thế lời khuyên y tế chuyên nghiệp</strong>. Luôn tham khảo bác sĩ hoặc chuyên gia y tế của bạn cho các quyết định sức khỏe.
            </p>
          </Section>

          <Section title="3. Đăng ký tài khoản" icon="👤">
            <p>Để sử dụng đầy đủ tính năng, bạn cần tạo tài khoản. Bạn đồng ý:</p>
            <ul>
              <li>Cung cấp thông tin chính xác và cập nhật.</li>
              <li>Bảo mật thông tin đăng nhập và không chia sẻ tài khoản với người khác.</li>
              <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép vào tài khoản của bạn.</li>
              <li>Chịu trách nhiệm về mọi hoạt động xảy ra dưới tài khoản của mình.</li>
            </ul>
          </Section>

          <Section title="4. Gói đăng ký & Thanh toán" icon="💳">
            <div
              style={{
                background: 'linear-gradient(135deg, #FFF8E1, #FFF3B0)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 16,
                border: '1px solid rgba(255,215,0,0.4)',
              }}
            >
              <strong>📌 Thông tin quan trọng về Auto-Renewable Subscription</strong>
            </div>
            <p><strong>Các gói đăng ký hiện có:</strong></p>
            <ul>
              <li><strong>Gói tháng:</strong> 39.000₫/tháng — Gia hạn tự động hàng tháng.</li>
              <li><strong>Gói 6 tháng:</strong> 199.000₫/6 tháng — Gia hạn tự động sau 6 tháng.</li>
              <li><strong>Gói năm:</strong> 399.000₫/năm — Gia hạn tự động hàng năm.</li>
            </ul>
            <p><strong>Điều khoản thanh toán:</strong></p>
            <ul>
              <li>Thanh toán được tính vào tài khoản Apple ID của bạn khi xác nhận mua hàng.</li>
              <li>Gói đăng ký tự động gia hạn trừ khi bạn hủy ít nhất <strong>24 giờ</strong> trước ngày hết hạn.</li>
              <li>Phí gia hạn sẽ được tính trong vòng 24 giờ trước khi kết thúc kỳ thanh toán hiện tại.</li>
              <li>Sau khi mua, <strong>không được hoàn tiền</strong> cho phần thời gian chưa sử dụng trong kỳ hiện tại.</li>
            </ul>
            <p><strong>Cách hủy đăng ký:</strong></p>
            <ul>
              <li>Mở <strong>Cài đặt</strong> → <strong>Apple ID</strong> → <strong>Đăng ký</strong> → Chọn PregTap → <strong>Hủy đăng ký</strong>.</li>
            </ul>
          </Section>

          <Section title="5. Tính năng Premium" icon="⭐">
            <p>Khi đăng ký gói Premium, bạn được truy cập:</p>
            <ul>
              <li>Toàn bộ các tính năng theo dõi và phân tích nâng cao.</li>
              <li>Tính năng AI: gợi ý thực đơn, phân tích OCR hồ sơ y tế.</li>
              <li>Báo cáo sức khỏe chi tiết và biểu đồ xu hướng.</li>
              <li>Xuất dữ liệu cá nhân ra file.</li>
              <li>Thông báo đẩy chuyên sâu và nhắc lịch ưu tiên.</li>
            </ul>
            <p>
              Tính năng miễn phí vẫn khả dụng sau khi hết hạn Premium. Quyền Premium sẽ bị thu hồi khi hủy hoặc không gia hạn.
            </p>
          </Section>

          <Section title="6. Quyền sở hữu trí tuệ" icon="©️">
            <p>
              Toàn bộ nội dung, giao diện, logo, code, và dữ liệu của PregTap thuộc quyền sở hữu của chúng tôi hoặc các đối tác cấp phép. Bạn được cấp quyền sử dụng cá nhân, không thương mại, không độc quyền để sử dụng Ứng dụng theo các Điều khoản này.
            </p>
            <p>Bạn <strong>không được</strong> sao chép, phân phối, chỉnh sửa, dịch ngược, hoặc tạo ra phiên bản phái sinh của Ứng dụng.</p>
          </Section>

          <Section title="7. Hành vi bị cấm" icon="🚫">
            <p>Khi sử dụng PregTap, bạn đồng ý không:</p>
            <ul>
              <li>Sử dụng Ứng dụng cho mục đích bất hợp pháp.</li>
              <li>Cố ý tải lên nội dung độc hại, virus hoặc mã độc.</li>
              <li>Cố ý truy cập trái phép vào hệ thống hoặc dữ liệu của người dùng khác.</li>
              <li>Thu thập dữ liệu người dùng khác khi chưa được phép.</li>
              <li>Sử dụng để quảng cáo mà không có sự cho phép bằng văn bản.</li>
            </ul>
          </Section>

          <Section title="8. Giới hạn trách nhiệm" icon="⚖️">
            <p>
              PregTap được cung cấp &quot;nguyên trạng&quot; và &quot;theo sẵn có&quot;. Chúng tôi không đảm bảo ứng dụng hoạt động liên tục, không có lỗi. Chúng tôi không chịu trách nhiệm về:
            </p>
            <ul>
              <li>Các quyết định y tế được đưa ra dựa trên thông tin từ ứng dụng.</li>
              <li>Mất mát dữ liệu do sự cố kỹ thuật ngoài tầm kiểm soát.</li>
              <li>Thiệt hại gián tiếp phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.</li>
            </ul>
          </Section>

          <Section title="9. Chấm dứt dịch vụ" icon="🔚">
            <p>
              Chúng tôi có quyền tạm ngừng hoặc chấm dứt tài khoản của bạn nếu bạn vi phạm các Điều khoản này. Bạn cũng có thể tự xóa tài khoản bất kỳ lúc nào trong phần Cài đặt ứng dụng.
            </p>
          </Section>

          <Section title="10. Thay đổi điều khoản" icon="🔄">
            <p>
              Chúng tôi có thể cập nhật Điều khoản này theo thời gian. Phiên bản mới nhất luôn được đăng tại <strong>https://pregtap.com/terms-of-use</strong>. Việc tiếp tục sử dụng sau khi Điều khoản được cập nhật nghĩa là bạn đồng ý với các thay đổi đó.
            </p>
          </Section>

          <Section title="11. Luật áp dụng" icon="🏛️">
            <p>
              Các Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết tại Tòa án có thẩm quyền tại Việt Nam.
            </p>
          </Section>

          <Section title="12. Liên hệ" icon="📬">
            <p>Nếu bạn có câu hỏi về Điều khoản sử dụng này, liên hệ:</p>
            <ul>
              <li><strong>Email:</strong> support@pregtap.com</li>
              <li><strong>Website:</strong> https://pregtap-web.vercel.app</li>
            </ul>
          </Section>
        </div>

        {/* Footer nav */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,150,144,0.2)',
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" style={{ color: '#FF9690', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            ← Trang chủ
          </Link>
          <Link href="/privacy-policy" style={{ color: '#FF9690', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Chính sách bảo mật →
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '28px 32px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <h2
        style={{
          margin: '0 0 16px',
          fontSize: 18,
          fontWeight: 800,
          color: '#3E2723',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 22 }}>{icon}</span>
        {title}
      </h2>
      <div
        style={{
          fontSize: 15,
          color: '#5D4037',
          lineHeight: 1.8,
        }}
      >
        {children}
      </div>
    </div>
  );
}
