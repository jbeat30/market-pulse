'use client';

import { Download } from 'lucide-react';

interface ExcelExportButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/** Excel(.xlsx) 다운로드 버튼 — outline 스타일. Chapter 4에서 실제 export API 연결 예정 */
export const ExcelExportButton = ({ onClick, disabled = false }: ExcelExportButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="toss-btn toss-btn-outline disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" strokeWidth={2} />
      Excel 내보내기
    </button>
  );
};
