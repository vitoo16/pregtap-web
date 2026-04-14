import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật - PregTap',
  description:
    'Chính sách bảo mật của PregTap. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.',
};

const LAST_UPDATED = '14 tháng 4, 2026';

export default function PrivacyPolicyPage() {
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
            background: 'linear-gradient(135deg, #FF9690 0%, #FF7A74 100%)',
            borderRadius: 24,
            padding: '40px 36px',
            marginBottom: 32,
            color: '#fff',
            boxShadow: '0 8px 24px rgba(255,150,144,0.30)',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            Chính sách bảo mật
          </h1>
          <p style={{ marginTop: 10, fontSize: 15, opacity: 0.9, lineHeight: 1.6 }}>
            PregTap cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn.
            Vui lòng đọc kỹ chính sách này để hiểu cách chúng tôi xử lý thông tin.
          </p>
          <div
            style={{
              marginTop: 16,
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 999,
              padding: '4px 14px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Cập nhật lần cuối: {LAST_UPDATED}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Section title="1. Thông tin chúng tôi thu thập" icon="📋">
            <p>Khi bạn sử dụng ứng dụng PregTap, chúng tôi có thể thu thập các loại thông tin sau:</p>
            <ul>
              <li><strong>Thông tin tài khoản:</strong> Họ tên, địa chỉ email, số điện thoại khi bạn đăng ký.</li>
              <li><strong>Dữ liệu thai kỳ:</strong> Ngày dự sinh, tuần thai, cân nặng, nhịp tim thai nhi và các chỉ số sức khỏe bạn nhập vào ứng dụng.</li>
              <li><strong>Hồ sơ y tế:</strong> Tài liệu, kết quả xét nghiệm và siêu âm bạn tải lên.</li>
              <li><strong>Dữ liệu cảm xúc:</strong> Nhật ký tâm trạng và ghi chú hàng ngày.</li>
              <li><strong>Thông tin thanh toán:</strong> Dữ liệu giao dịch qua App Store (chúng tôi không lưu trữ thông tin thẻ tín dụng trực tiếp).</li>
              <li><strong>Dữ liệu kỹ thuật:</strong> Loại thiết bị, phiên bản hệ điều hành, nhật ký lỗi ứng dụng.</li>
            </ul>
          </Section>

          <Section title="2. Mục đích sử dụng thông tin" icon="🎯">
            <p>PregTap sử dụng thông tin thu thập được để:</p>
            <ul>
              <li>Cung cấp, vận hành và cải thiện ứng dụng và dịch vụ.</li>
              <li>Cá nhân hóa trải nghiệm theo dõi thai kỳ của bạn.</li>
              <li>Gợi ý thực đơn dinh dưỡng và lịch nhắc phù hợp.</li>
              <li>Xử lý thanh toán và quản lý gói đăng ký.</li>
              <li>Gửi thông báo liên quan đến sức khỏe và lịch khám thai (nếu bạn đồng ý).</li>
              <li>Đảm bảo bảo mật tài khoản và phát hiện gian lận.</li>
              <li>Tuân thủ các nghĩa vụ pháp lý.</li>
            </ul>
          </Section>

          <Section title="3. Chia sẻ thông tin với bên thứ ba" icon="🤝">
            <p>
              Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:
            </p>
            <ul>
              <li><strong>Apple App Store:</strong> Xác minh giao dịch mua hàng trong ứng dụng (In-App Purchase) theo quy trình của Apple.</li>
              <li><strong>Nhà cung cấp dịch vụ:</strong> Các đối tác kỹ thuật vận hành cơ sở hạ tầng (hosting, lưu trữ đám mây) theo hợp đồng bảo mật nghiêm ngặt.</li>
              <li><strong>Yêu cầu pháp lý:</strong> Khi được yêu cầu bởi cơ quan có thẩm quyền theo quy định pháp luật.</li>
            </ul>
          </Section>

          <Section title="4. Bảo mật dữ liệu" icon="🛡️">
            <p>Chúng tôi áp dụng các biện pháp bảo mật hiện đại bao gồm:</p>
            <ul>
              <li>Mã hóa dữ liệu khi truyền tải (TLS/HTTPS).</li>
              <li>Mã hóa dữ liệu khi lưu trữ (Encryption at Rest).</li>
              <li>Kiểm soát truy cập chặt chẽ và xác thực hai yếu tố cho hệ thống nội bộ.</li>
              <li>Kiểm tra bảo mật định kỳ.</li>
            </ul>
            <p>
              Tuy nhiên, không có hệ thống nào an toàn tuyệt đối. Vui lòng bảo vệ mật khẩu và thông tin đăng nhập của bạn.
            </p>
          </Section>

          <Section title="5. Quyền của bạn" icon="✋">
            <p>Bạn có các quyền sau đối với dữ liệu cá nhân của mình:</p>
            <ul>
              <li><strong>Truy cập:</strong> Yêu cầu bản sao dữ liệu chúng tôi lưu về bạn.</li>
              <li><strong>Chỉnh sửa:</strong> Cập nhật hoặc sửa thông tin không chính xác.</li>
              <li><strong>Xóa:</strong> Yêu cầu xóa tài khoản và toàn bộ dữ liệu.</li>
              <li><strong>Xuất:</strong> Tải xuống dữ liệu cá nhân (tính năng dành cho gói Premium).</li>
              <li><strong>Từ chối:</strong> Tắt thông báo hoặc không đồng ý thu thập một số loại dữ liệu.</li>
            </ul>
            <p>Để thực hiện các quyền này, liên hệ chúng tôi qua: <strong>support@pregtap.com</strong></p>
          </Section>

          <Section title="6. Cookies & Theo dõi" icon="🍪">
            <p>
              Ứng dụng di động PregTap không sử dụng cookies. Website sử dụng cookies cần thiết để duy trì phiên đăng nhập và cải thiện hiệu suất. Bạn có thể tắt cookies qua cài đặt trình duyệt, nhưng một số tính năng có thể bị ảnh hưởng.
            </p>
          </Section>

          <Section title="7. Lưu trữ dữ liệu" icon="💾">
            <p>
              Dữ liệu của bạn được lưu trữ trong thời gian tài khoản còn hoạt động và tối đa <strong>90 ngày</strong> sau khi bạn xóa tài khoản (trừ trường hợp pháp luật yêu cầu giữ lại lâu hơn). Dữ liệu y tế nhạy cảm được xóa ngay khi bạn yêu cầu.
            </p>
          </Section>

          <Section title="8. Trẻ em" icon="👶">
            <p>
              Dịch vụ PregTap không dành cho người dưới 18 tuổi. Chúng tôi không cố ý thu thập thông tin từ người dưới 18 tuổi. Nếu phát hiện, chúng tôi sẽ xóa dữ liệu ngay lập tức.
            </p>
          </Section>

          <Section title="9. Thay đổi chính sách" icon="📝">
            <p>
              Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua ứng dụng hoặc email đăng ký. Việc tiếp tục sử dụng dịch vụ sau thông báo được coi là bạn đồng ý với chính sách mới.
            </p>
          </Section>

          <Section title="10. Liên hệ" icon="📬">
            <p>Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:</p>
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
          <Link href="/terms-of-use" style={{ color: '#FF9690', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Điều khoản sử dụng →
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
