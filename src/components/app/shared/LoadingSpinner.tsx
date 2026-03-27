export function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <div
      className="loading-spinner"
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(2, size / 8),
      }}
      role="status"
      aria-label="Đang tải"
    />
  );
}

export function LoadingOverlay({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center">
        <LoadingSpinner size={40} />
        {message && (
          <p className="mt-4 text-sm font-medium text-[#757575]">{message}</p>
        )}
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-card">
      <div className="h-4 w-32 rounded bg-[#F5F5F5]" />
      <div className="mt-4 h-32 rounded bg-[#F5F5F5]" />
    </div>
  );
}
