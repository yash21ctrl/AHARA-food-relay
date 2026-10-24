import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { PRESET_AREAS, ORG_TYPES, APP_NAME } from '../config';
import { OrgType, Role } from '../types';
import { showToast } from '../lib/toast';
import { HeartHandshake, Building, UserCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const [role, setRole] = useState<Role>('donor');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [areaId, setAreaId] = useState(PRESET_AREAS[0].id);
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrgType>('NGO');

  const registerUser = useAppStore((s) => s.registerUser);
  const users = useAppStore((s) => s.users);
  const switchUser = useAppStore((s) => s.switchUser);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerUser({
      role,
      name,
      phone,
      areaId,
      orgName: role === 'receiver' ? orgName : undefined,
      orgType: role === 'receiver' ? orgType : undefined
    });

    if (result.ok) {
      showToast(`Welcome to ${APP_NAME}, ${name}!`, 'success');
      navigate('/');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleQuickSwitch = (userId: string) => {
    const res = switchUser(userId);
    if (res.ok) {
      showToast('Switched user successfully', 'success');
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Join {APP_NAME}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Connect surplus event food directly with verified organizations in minutes.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8">
        {/* Role Picker */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              role === 'donor'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-5 h-5" />
            <span>Food Donor</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('receiver')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              role === 'receiver'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-5 h-5" />
            <span>Recipient (NGO / Home)</span>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Phone (10 digits) <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9876543210"
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {role === 'receiver' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Organization / Shelter Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Hope Orphanage Foundation"
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Organization Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value as OrgType)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  {ORG_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Base Area / Neighborhood <span className="text-rose-500">*</span>
            </label>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              {PRESET_AREAS.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md shadow-emerald-600/20"
            >
              Complete Registration & Enter
            </button>
          </div>
        </form>

        {/* Quick Demo Switcher Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <span>Or Quick Login as Demo Account</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickSwitch(u.id)}
                className="flex items-center justify-between p-2.5 text-left rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-slate-500">
                    {u.role === 'donor' ? 'Donor' : u.orgName} • {u.areaId}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
