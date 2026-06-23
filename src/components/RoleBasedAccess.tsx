import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Role } from '../types';
import { ShieldAlert, ShieldCheck, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface RoleBasedAccessProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

const ROLE_PASSWORDS: Record<Role, string> = {
  'Budget Officer': 'budget123',
  'Chief Accountant': 'accountant123',
  'Disbursing Cashier': 'cashier123',
  'Administrator': 'admin123'
};

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ allowedRoles, children }) => {
  const { activeRole, setActiveRole } = useWorkflow();

  // Modal prompt states
  const [promptRole, setPromptRole] = useState<Role | null>(null);
  const [typedPassword, setTypedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Administrators have access to all dashboards/views automatically.
  const hasAccess = allowedRoles.includes(activeRole) || activeRole === 'Administrator';

  const getCustomPasswords = (): Record<string, string> => {
    try {
      const stored = localStorage.getItem('dost_custom_credentials');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const handleAuthorizeRole = (role: Role) => {
    setPromptRole(role);
    setTypedPassword('');
    setShowPassword(false);
    setErrorMessage(null);
  };

  const verifyAndSetRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptRole) return;

    const basePassword = ROLE_PASSWORDS[promptRole];
    const customCreds = getCustomPasswords();
    
    // Check standard or custom passwords registered for this role
    let isValid = typedPassword === basePassword;

    // Also support any custom user passwords matching this role
    if (!isValid) {
      const matchingCustoms = Object.entries(customCreds).some(([email, pass]) => {
        // Simple logic to check if a custom registered account password matches
        return pass === typedPassword;
      });
      if (matchingCustoms) {
        isValid = true;
      }
    }

    if (isValid) {
      setActiveRole(promptRole);
      setPromptRole(null);
      setTypedPassword('');
    } else {
      setErrorMessage("Access Refused: Invalid clearance password for this desk.");
    }
  };

  if (!hasAccess) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center shadow-xs font-inter relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>

        <div className="inline-flex p-4 bg-amber-50 rounded-2xl text-amber-600 mb-4 border border-amber-100">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>
        <h3 className="font-sans font-black text-xl text-slate-800 tracking-tight mb-2 uppercase">
          Administrative Desk Locked
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
          You are currently signed on with <span className="font-semibold text-slate-800">{activeRole}</span> clearance. 
          To unlock this specialized section, please verify the authorized desk security credentials.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          {allowedRoles.map((role) => (
            <button
              key={role}
              onClick={() => handleAuthorizeRole(role)}
              className="px-4 py-2.5 bg-[#0c4a6e] hover:bg-[#073652] text-white rounded-xl transition text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Unlock {role} Section
            </button>
          ))}
          <button
            onClick={() => handleAuthorizeRole('Administrator')}
            className="px-4 py-2.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 transition text-xs font-bold cursor-pointer"
          >
            Bypass as Administrator
          </button>
        </div>

        {/* Verification Modal Popup Overlay */}
        {promptRole && (
          <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5 p-6 space-y-4 text-left">
              
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-black text-slate-850 tracking-tight uppercase text-sm">Clearance Verification Required</h4>
                  <p className="text-[11px] text-slate-400">Section Security lock active for: <span className="font-semibold text-[#0c4a6e]">{promptRole}</span></p>
                </div>
              </div>

              <form onSubmit={verifyAndSetRole} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                    <span>Authorized Key</span>
                    <span className="text-[#0c4a6e] bg-slate-50 py-0.5 px-2 border border-slate-200/60 rounded-md font-mono normal-case">
                      Preset key for testing: <span className="font-bold">{ROLE_PASSWORDS[promptRole] || "custom account password"}</span>
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      autoFocus
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter administrative passcode..."
                      className="w-full pl-9 pr-12 h-10 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-350 focus:outline-none focus:ring-1 focus:ring-[#0c4a6e] focus:border-[#0c4a6e]"
                      value={typedPassword}
                      onChange={(e) => setTypedPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer select-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 inline-flex items-center gap-1 animate-pulse font-sans">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errorMessage}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setPromptRole(null)}
                    className="px-3.5 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition font-sans cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4  py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 font-sans cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verify
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
