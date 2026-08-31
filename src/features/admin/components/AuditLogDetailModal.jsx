import React from 'react';
import Icon from '../../../shared/components/Icon';
import { getAuditActionInfo, formatEntityName } from '../utils/audit.utils';

export default function AuditLogDetailModal({ log, onClose }) {
  if (!log) return null;

  const actionInfo = getAuditActionInfo(log.action_admin_audit_log || log.action);
  const entityName = formatEntityName(log.entity_admin_audit_log || log.entity);
  const entityId = log.entity_id_admin_audit_log || log.entity_id;

  const parseData = (d) => {
    if (!d) return null;
    if (typeof d === 'object') return d;
    try {
      return JSON.parse(d);
    } catch {
      return d;
    }
  };

  const oldData = parseData(log.old_data);
  const newData = parseData(log.new_data);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Chi tiết nhật ký hoạt động
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${actionInfo.color}`}>
                {actionInfo.label}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                #{log.admin_audit_log_id || log.id}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Thời gian: {new Date(log.created_at || Date.now()).toLocaleString('vi-VN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white text-xl cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        {/* Actor & Target Entity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400">Admin thực hiện (Actor)</span>
            <p className="font-black text-black dark:text-white mt-0.5">
              {log.actor?.full_name || log.actor?.email || 'Quản trị viên'}
            </p>
            <p className="text-neutral-500 font-mono text-[10px]">{log.user_id || log.actor?.user_id}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400">Đối tượng tác động (Entity)</span>
            <p className="font-black text-black dark:text-white mt-0.5">
              {entityName} {entityId ? `(ID: ${entityId})` : ''}
            </p>
            <p className="text-neutral-500 font-mono text-[10px]">{log.entity_admin_audit_log || log.entity}</p>
          </div>
        </div>

        {/* Data Changes: Old vs New */}
        <div className="space-y-4">
          <h4 className="font-bold uppercase tracking-wider text-neutral-500 text-xs">
            Dữ liệu thay đổi (Snapshot Diff)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Old Data */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-rose-500 uppercase flex items-center gap-1">
                <Icon icon="solar:minus-circle-linear" />
                <span>Trước thay đổi (Old Data)</span>
              </span>
              <pre className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {oldData ? JSON.stringify(oldData, null, 2) : '(Không có dữ liệu cũ)'}
              </pre>
            </div>

            {/* New Data */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                <Icon icon="solar:check-circle-linear" />
                <span>Sau thay đổi (New Data)</span>
              </span>
              <pre className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {newData ? JSON.stringify(newData, null, 2) : '(Không có dữ liệu mới)'}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider hover:opacity-85 cursor-pointer shadow-md"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
