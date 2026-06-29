import React from 'react';

const Badge = ({ status }) => {
  let colorClass = 'bg-slate-100 text-slate-700';

  switch (status) {
    case 'Chưa xử lý':
      colorClass = 'bg-slate-100 text-slate-600 border border-slate-200';
      break;
    case 'Chặn người lạ':
      colorClass = 'bg-amber-100 text-amber-800 border border-amber-200';
      break;
    case 'Đã gửi tin nhắn':
      colorClass = 'bg-blue-100 text-blue-800 border border-blue-200';
      break;
    case 'Không có Zalo':
      colorClass = 'bg-red-600 text-white border border-red-700 font-bold';
      break;
    case 'Trả lời':
      colorClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status || 'Chưa xử lý'}
    </span>
  );
};

export default Badge;
