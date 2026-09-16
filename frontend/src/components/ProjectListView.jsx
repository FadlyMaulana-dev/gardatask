import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, User, ClipboardList } from 'lucide-react';

export default function ProjectListView({ tasksByStatus, onAddTask, onOpenDetail }) {
  const statusConfig = {
    todo:        { label: 'To Do',       dot: 'bg-blue-400',   badge: 'bg-blue-900/40 text-blue-300 border border-blue-700/40' },
    in_progress: { label: 'In Progress', dot: 'bg-violet-400', badge: 'bg-violet-900/40 text-violet-300 border border-violet-700/40' },
    done:        { label: 'Done',        dot: 'bg-green-400',  badge: 'bg-green-900/40 text-green-300 border border-green-700/40' },
    cancelled:   { label: 'Cancelled',   dot: 'bg-red-400',    badge: 'bg-red-900/40 text-red-300 border border-red-700/40' },
  };

  const priorityColors = {
    low:    'bg-[#1e3a29] text-[#71cf92]',
    medium: 'bg-[#403517] text-[#f2c94c]',
    high:   'bg-[#451e1e] text-[#eb5757]',
    urgent: 'bg-red-600 text-white',
  };

  const doneDotIcon = (statusId) => {
    if (statusId === 'done') return 'bg-green-500';
    if (statusId === 'in_progress') return 'border-violet-400';
    if (statusId === 'cancelled') return 'border-red-400';
    return '';
  };

  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (statusId) => {
    setCollapsedGroups(prev => ({ ...prev, [statusId]: !prev[statusId] }));
  };

  const totalTasks = Object.values(tasksByStatus).reduce((s, arr) => s + arr.length, 0);

  const Group = ({ statusId, tasks }) => {
    const isCollapsed = collapsedGroups[statusId];
    const config = statusConfig[statusId] || statusConfig.todo;

    return (
      <div className="mb-2">
        {/* Group Header */}
        <div
          className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-lg hover:bg-white/[0.04] transition-colors w-full group"
          onClick={() => toggleGroup(statusId)}
        >
          {isCollapsed
            ? <ChevronRight size={15} className="text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
            : <ChevronDown  size={15} className="text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
          }

          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.dot}`} />

          <h3 className="text-white font-semibold text-[14px]">{config.label}</h3>

          {/* Task count badge */}
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
            {tasks.length}
          </span>
        </div>

        {/* Table */}
        {!isCollapsed && (
          <div className="overflow-hidden mt-1 mb-4">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="text-[12px] font-normal text-slate-500 border-b border-slate-700/60">
                  <th className="p-2 pb-2.5 w-1/2 font-normal pl-9">Name</th>
                  <th className="p-2 pb-2.5 w-36 font-normal border-l border-slate-700/40">Assignee</th>
                  <th className="p-2 pb-2.5 w-32 font-normal border-l border-slate-700/40">Due date</th>
                  <th className="p-2 pb-2.5 w-32 font-normal border-l border-slate-700/40">Priority</th>
                  <th className="p-2 pb-2.5 w-12 font-normal border-l border-slate-700/40 text-center">+</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-600">
                        <ClipboardList size={20} className="text-slate-700" />
                        <span className="text-[12px]">Belum ada task di kolom ini</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => onOpenDetail?.(task)}
                      className="border-b border-slate-800/70 hover:bg-white/[0.04] transition-colors group cursor-pointer"
                    >
                      {/* Name */}
                      <td className="p-2 pl-9 text-[13px] text-[#e8e8e8] flex items-center gap-3 relative min-h-[40px]">
                        <div className={`absolute left-2.5 w-[13px] h-[13px] rounded-full border border-slate-600 flex items-center justify-center shrink-0 group-hover:border-slate-400 transition-colors ${statusId === 'done' || statusId === 'in_progress' || statusId === 'cancelled' ? 'overflow-hidden' : ''}`}>
                          {statusId === 'done' && <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center"><span className="text-[8px] text-white font-bold">✓</span></div>}
                          {statusId === 'in_progress' && <div className="w-1.5 h-1.5 bg-violet-400 rounded-full" />}
                          {statusId === 'cancelled' && <div className="w-full h-full bg-red-500/30 rounded-full flex items-center justify-center"><span className="text-[7px] text-red-400">✕</span></div>}
                        </div>
                        <span className="truncate pr-4 group-hover:text-white transition-colors" title={task.title}>
                          {task.title}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="p-2 text-[13px] border-l border-slate-700/40">
                        {task.user ? (
                          <div className="flex items-center gap-2">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#f2c94c] text-black flex items-center justify-center text-[9px] font-bold shadow-sm shrink-0">
                              {task.user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-slate-300 text-xs truncate max-w-[80px]" title={task.user.name}>
                              {task.user.name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <div className="w-[22px] h-[22px] rounded-full border border-dashed border-slate-600 flex items-center justify-center text-slate-600">
                            <User size={10} />
                          </div>
                        )}
                      </td>

                      {/* Due date */}
                      <td className="p-2 text-[12px] border-l border-slate-700/40 text-slate-400">
                        {task.due_date
                          ? new Date(task.due_date.split('T')[0]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                          : <span className="text-slate-700">—</span>}
                      </td>

                      {/* Priority */}
                      <td className="p-2 text-[13px] border-l border-slate-700/40">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-sm font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                          {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                        </span>
                      </td>

                      {/* Extra col */}
                      <td className="p-2 border-l border-slate-700/40" onClick={e => e.stopPropagation()} />
                    </tr>
                  ))
                )}

                {/* Add task row */}
                <tr>
                  <td colSpan="5" className="border-b border-transparent">
                    <button
                      onClick={() => onAddTask(statusId)}
                      className="flex items-center gap-2 text-[12px] text-slate-600 hover:text-slate-300 transition-colors w-full px-2 py-2 pl-9"
                    >
                      <Plus size={14} className="text-slate-600" />
                      <span>Add task...</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#1E1F21] w-full min-h-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
      {/* Header info bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800 shrink-0">
        <ClipboardList size={15} className="text-slate-500" />
        <span className="text-[12px] text-slate-500">
          Menampilkan data dari Kanban Board —&nbsp;
          <span className="text-slate-300 font-semibold">{totalTasks} task</span>
          &nbsp;di {Object.values(tasksByStatus).filter(a => a.length > 0).length} kolom aktif
        </span>
        {/* Mini summary pills */}
        <div className="flex items-center gap-2 ml-auto">
          {Object.entries(tasksByStatus).map(([statusId, arr]) => {
            const cfg = statusConfig[statusId];
            return (
              <span key={statusId} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                {cfg.label}: {arr.length}
              </span>
            );
          })}
        </div>
      </div>

      {/* List groups */}
      <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
        {Object.entries(tasksByStatus).map(([statusId, tasks]) => (
          <Group key={statusId} statusId={statusId} tasks={tasks} />
        ))}
      </div>
    </div>
  );
}
