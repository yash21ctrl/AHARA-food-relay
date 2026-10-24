import React, { useState } from 'react';
import { useAppStore } from '../store';
import { PRESET_AREAS, ORG_TYPES } from '../config';
import { OrgType } from '../types';
import { showToast } from '../lib/toast';
import { Building, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReceiverAuth: React.FC = () => {
  const users = useAppStore((s) => s.users);
  const registerUser = useAppStore((s) => s.registerUser);
  const loginUser = useAppStore((s) => s.loginUser);

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrgType>('NGO');
  const [areaId, setAreaId] = useState(PRESET_AREAS[1]?.id || PRESET_AREAS[0].id);

  const receiverUsers = users.filter((u) => u.role === 'receiver');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerUser({
      role: 'receiver',
      name: name.trim(),
      phone: phone.trim(),
      orgName: orgName.trim(),
      orgType,
      areaId
    });

    if (res.ok) {
      showToast(`Welcome, ${orgName}! Signed in as Recipient.`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleLogin = (id: string) => {
    const res = loginUser(id);
    if (res.ok) {
      const u = users.find((user) => user.id === id);
      showToast(`Signed in as ${u?.orgName || u?.name}`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Portal Gateway
      </Link>

      <div className="max-w-md w-full bg-white rounded-3xl border border-blue-100 shadow-xl overflow-hidden p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 inline-block mb-1">
              Recipient Portal
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">NGO & Shelter Sign In</h1>
          </div>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl my-5">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Org</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Existing Login</span>
          </button>
        </div>

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Organization / Shelter Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Asha Orphanage Foundation"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Organization Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value as OrgType)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              >
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Coordinator / Representative Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sneha Rao"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone (10 digits) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9123456780"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Base Area / Neighborhood <span className="text-rose-500">*</span>
              </label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              >
                {PRESET_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md shadow-blue-600/20"
            >
              Register & Enter Food Feed
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            {receiverUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No recipient organizations registered yet. Switch to "Register Org" above to sign up your shelter/NGO.
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium mb-2">
                  Select your registered Organization to sign in:
                </p>
                {receiverUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleLogin(u.id)}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {u.orgName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {u.name} ({u.orgType}) • {u.areaId}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700">Login →</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
