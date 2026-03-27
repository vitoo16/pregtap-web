'use client';

import { motion } from 'framer-motion';
import { DoctorList } from '@/components/app/doctor/DoctorList';

export default function DoctorPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="relative overflow-hidden px-6 pt-6 pb-8 md:px-10"
        style={{
          background: 'linear-gradient(135deg, #FF9690 0%, #DA927B 100%)',
          borderRadius: '0 0 40px 40px',
        }}
      >
        <div className="absolute right-[-20px] top-[-20px] h-[100px] w-[100px] rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute -bottom-6 left-[-10px] h-[80px] w-[80px] rounded-full opacity-10" style={{ background: 'white' }} />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-xl font-bold text-white">Tư vấn bác sĩ</h1>
          <p className="mt-1 text-sm text-white/80">
            Kết nối với bác sĩ để được tư vấn sức khỏe thai kỳ
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="app-page-content">
        <DoctorList />
      </div>
    </div>
  );
}
