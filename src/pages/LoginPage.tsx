import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkflow, useAuth } from '../context/WorkflowContext';
import { User, Role } from '../types';
import { Mail, UserPlus, Check, Globe, AlertCircle, RefreshCw, Key, ShieldCheck, Twitter, Instagram, ArrowRight, Phone, Facebook } from 'lucide-react';

// Pure mathematical SVG representation of the official DOST Logo (exact match to official color scheme)
export function DostLogo({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top Left Circle */}
      {/* Black top half */}
      <path d="M 2 26 A 24 24 0 0 1 50 26 L 26 26 Z" fill="#000000" />
      {/* Blue bottom-left quadrant */}
      <path d="M 2 26 A 24 24 0 0 0 26 50 L 26 26 Z" fill="#00AEEF" />
      {/* White bottom-right quadrant */}
      <path d="M 26 26 L 26 50 A 24 24 0 0 0 50 26 Z" fill="#ffffff" />

      {/* Top Right Circle */}
      {/* Blue top-left quadrant */}
      <path d="M 50 26 A 24 24 0 0 1 74 2 L 74 26 Z" fill="#00AEEF" />
      {/* Black right half */}
      <path d="M 74 2 A 24 24 0 0 1 98 26 A 24 24 0 0 1 74 50 L 74 26 Z" fill="#000000" />
      {/* White bottom-left quadrant */}
      <path d="M 74 26 L 50 26 A 24 24 0 0 0 74 50 Z" fill="#ffffff" />

      {/* Bottom Left Circle */}
      {/* Black left half */}
      <path d="M 26 50 A 24 24 0 0 0 2 74 A 24 24 0 0 0 26 98 L 26 74 Z" fill="#000000" />
      {/* White top-right quadrant */}
      <path d="M 26 74 L 26 50 A 24 24 0 0 1 50 74 Z" fill="#ffffff" />
      {/* Blue bottom-right quadrant */}
      <path d="M 26 74 L 50 74 A 24 24 0 0 1 26 98 Z" fill="#00AEEF" />

      {/* Bottom Right Circle */}
      {/* White top-left quadrant */}
      <path d="M 74 74 L 50 74 A 24 24 0 0 1 74 50 Z" fill="#ffffff" />
      {/* Blue top-right quadrant */}
      <path d="M 74 74 L 74 50 A 24 24 0 0 1 98 74 Z" fill="#00AEEF" />
      {/* Black bottom half */}
      <path d="M 50 74 A 24 24 0 0 0 74 98 A 24 24 0 0 0 98 74 L 74 74 Z" fill="#000000" />

      {/* Center Black Star/Diamond */}
      <path d="M 26 50 A 24 24 0 0 0 50 26 A 24 24 0 0 0 74 50 A 24 24 0 0 0 50 74 A 24 24 0 0 0 26 50 Z" fill="#000000" />
    </svg>
  );
}

// Beautiful vector SVG logo representing InsideBox
export function InsideBoxLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#3b82f6" fillOpacity="0.4" />
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.5 7v10l-9.5 5-9.5-5V7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 7l10 5 10-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9.5l5 2.5 5-2.5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LoginPage() {
  const { signInWithGoogle, loading, error: authError } = useAuth();
  const [showAccounts, setShowAccounts] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Clearance passwords mapping for official accounts
  const ACCOUNT_PASSWORDS: Record<string, string> = {
    'loislainalcantara@gmail.com': 'admin123',
    'maria.santos@region5.dost.gov.ph': 'budget123',
    'cesar.aguinaldo@region5.dost.gov.ph': 'accountant123',
    'regina.clave@region5.dost.gov.ph': 'cashier123'
  };

  // Helper dictionary loaded from localStorage for custom generated workspace accounts
  const getCustomPasswords = (): Record<string, string> => {
    try {
      const stored = localStorage.getItem('dost_custom_credentials');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const saveCustomPassword = (email: string, pass: string) => {
    try {
      const current = getCustomPasswords();
      current[email.toLowerCase()] = pass;
      localStorage.setItem('dost_custom_credentials', JSON.stringify(current));
    } catch (e) {
      console.error(e);
    }
  };

  // Password verification and prompt states
  const [passwordVerificationAccount, setPasswordVerificationAccount] = useState<{
    name: string;
    email: string;
    role: Role;
    avatar?: string;
  } | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordMask, setShowPasswordMask] = useState(false);
  
  // Password reset helper states
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsResetting(true);
    setResetSuccessMessage(null);
    setTimeout(() => {
      setIsResetting(false);
      setResetSuccessMessage(`A password recovery instruction email has been sent successfully to ${resetEmail}. Please check your inbox.`);
      setResetEmail('');
    }, 1200);
  };

  // Direct login form states (matching InsideBox mockup layout)
  const [directEmail, setDirectEmail] = useState('');
  const [directPassword, setDirectPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotHelp, setShowForgotHelp] = useState(false);

  // Custom account creation state
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<Role>('Budget Officer');
  const [customPassword, setCustomPassword] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Pre-configured official DOST V accounts
  const googleAccounts = [
    {
      name: 'Lois Lain Alcantara',
      email: 'loislainalcantara@gmail.com',
      role: 'Administrator' as Role,
      badge: 'All Clearance Access',
      avatar: 'LA'
    },
    {
      name: 'Maria Santos',
      email: 'maria.santos@region5.dost.gov.ph',
      role: 'Budget Officer' as Role,
      badge: 'Budget & Allotment Unit',
      avatar: 'MS'
    },
    {
      name: 'Cesar Aguinaldo',
      email: 'cesar.aguinaldo@region5.dost.gov.ph',
      role: 'Chief Accountant' as Role,
      badge: 'Accounting & Tax Unit',
      avatar: 'CA'
    },
    {
      name: 'Regina Clave',
      email: 'regina.clave@region5.dost.gov.ph',
      role: 'Disbursing Cashier' as Role,
      badge: 'Cashier & Fiscal Unit',
      avatar: 'RC'
    }
  ];

  const handleSelectAccountClick = (acc: typeof googleAccounts[0]) => {
    // Initiate secure password verification phase
    setPasswordVerificationAccount(acc);
    setPasswordInput('');
    setPasswordError(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordVerificationAccount) return;

    const email = passwordVerificationAccount.email.toLowerCase();
    const correctPassword = ACCOUNT_PASSWORDS[email] || getCustomPasswords()[email];

    if (!correctPassword) {
      setPasswordError("No clearance key registered for this workspace email.");
      return;
    }

    if (passwordInput !== correctPassword) {
      setPasswordError("Access Restricted: Invalid administrative password.");
      return;
    }

    setLoadingAccount(passwordVerificationAccount.email);
    setPasswordError(null);
    try {
      await signInWithGoogle(passwordVerificationAccount.name, passwordVerificationAccount.email, passwordVerificationAccount.role);
      // Save password to session to represent signed token signature
      sessionStorage.setItem('dost_session_signed_pass', correctPassword);
      setPasswordVerificationAccount(null);
      setShowAccounts(false);
    } catch (err: any) {
      setPasswordError(err.message || "Authentication token request refused.");
    } finally {
      setLoadingAccount(null);
    }
  };

  // Direct Credentials login submission handler
  const handleDirectLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailClean = directEmail.trim().toLowerCase();
    const passClean = directPassword.trim();

    if (!emailClean || !passClean) {
      setErrorMessage("Please complete all employee credentials.");
      return;
    }

    // Check pre-configured DOST Bicol accounts
    const match = googleAccounts.find(acc => acc.email.toLowerCase() === emailClean);
    let correctPassword = ACCOUNT_PASSWORDS[emailClean];
    let roleToUse: Role | null = null;
    let nameToUse = '';

    if (match) {
      roleToUse = match.role;
      nameToUse = match.name;
    } else {
      // Check custom accounts from local storage
      const customPassMap = getCustomPasswords();
      if (customPassMap[emailClean]) {
        correctPassword = customPassMap[emailClean];
      }
    }

    // If matches custom password but no role was mapped, lookup in detailed array
    if (correctPassword && passClean === correctPassword) {
      if (roleToUse) {
        setLoadingAccount(emailClean);
        try {
          await signInWithGoogle(nameToUse, emailClean, roleToUse);
          sessionStorage.setItem('dost_session_signed_pass', passClean);
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to direct authenticate.");
        } finally {
          setLoadingAccount(null);
        }
        return;
      } else {
        // Find custom detailed account
        try {
          const stored = localStorage.getItem('dost_custom_accounts_detailed');
          const detailedList = stored ? JSON.parse(stored) : [];
          const customAcct = detailedList.find((x: any) => x.email.toLowerCase() === emailClean);
          if (customAcct) {
            setLoadingAccount(emailClean);
            await signInWithGoogle(customAcct.name, customAcct.email, customAcct.role);
            sessionStorage.setItem('dost_session_signed_pass', passClean);
            setLoadingAccount(null);
            return;
          }
        } catch {
          // ignore
        }
      }
    }

    // If incorrect password for recognized account
    if (correctPassword && passClean !== correctPassword) {
      setErrorMessage("Access Restricted: Invalid administrative password.");
      return;
    }

    // Fallback: search custom accounts list
    try {
      const stored = localStorage.getItem('dost_custom_accounts_detailed');
      const detailedList = stored ? JSON.parse(stored) : [];
      const customAcct = detailedList.find((x: any) => x.email.toLowerCase() === emailClean);
      if (customAcct) {
        if (passClean === customAcct.password) {
          setLoadingAccount(emailClean);
          await signInWithGoogle(customAcct.name, customAcct.email, customAcct.role);
          sessionStorage.setItem('dost_session_signed_pass', passClean);
          setLoadingAccount(null);
          return;
        } else {
          setErrorMessage("Access Restricted: Invalid administrative password.");
          return;
        }
      }
    } catch {
      // ignore
    }

    setErrorMessage("No clearance account registered for this email. Please check spelling or use the account selector.");
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customEmail.trim() || !customName.trim() || !customPassword.trim()) {
      setErrorMessage("Please complete all employee credentials and clearance passwords.");
      return;
    }

    if (customPassword.trim().length < 4) {
      setErrorMessage("Organizational security policy: password must be at least 4 characters.");
      return;
    }

    const emailWithDomain = customEmail.includes('@') ? customEmail : `${customEmail.trim()}@region5.dost.gov.ph`;

    // Secure organizational validation
    if (emailWithDomain.includes('@') && !emailWithDomain.endsWith('.dost.gov.ph') && !emailWithDomain.endsWith('@gmail.com')) {
      setErrorMessage("Access Restricted (403): Organizational email must be a valid DOST workplace domain.");
      return;
    }
    
    setLoadingAccount('custom');
    try {
      // Save password in local storage dictionary for test logins in this workstation
      saveCustomPassword(emailWithDomain, customPassword.trim());

      // Save detailed accounts array for direct form logins
      try {
        const stored = localStorage.getItem('dost_custom_accounts_detailed');
        const detailedList = stored ? JSON.parse(stored) : [];
        const existingIdx = detailedList.findIndex((x: any) => x.email.toLowerCase() === emailWithDomain.toLowerCase());
        const newAccount = {
          name: customName.trim(),
          email: emailWithDomain,
          role: customRole,
          password: customPassword.trim()
        };
        if (existingIdx >= 0) {
          detailedList[existingIdx] = newAccount;
        } else {
          detailedList.push(newAccount);
        }
        localStorage.setItem('dost_custom_accounts_detailed', JSON.stringify(detailedList));
      } catch (errCustom) {
        console.error(errCustom);
      }
      
      await signInWithGoogle(customName.trim(), emailWithDomain, customRole);
      // Save password to session
      sessionStorage.setItem('dost_session_signed_pass', customPassword.trim());
      
      setIsCreatingCustom(false);
      setShowAccounts(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoadingAccount(null);
    }
  };

  // Dynamic greeting matching entered email
  const getGreetingName = () => {
    const emailClean = directEmail.trim().toLowerCase();
    if (!emailClean) return '';
    const match = googleAccounts.find(acc => acc.email.toLowerCase() === emailClean);
    if (match) return match.name;
    try {
      const stored = localStorage.getItem('dost_custom_accounts_detailed');
      const detailedList = stored ? JSON.parse(stored) : [];
      const customAcct = detailedList.find((x: any) => x.email.toLowerCase() === emailClean);
      if (customAcct) return customAcct.name;
    } catch {
      // ignore
    }
    return '';
  };

  const displayNameForGreeting = getGreetingName();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Main Container - High Fidelity Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row bg-slate-100">
        
        {/* Left Panel: DOST Regional Branding (OneDOST4U theme) */}
        <div className="flex md:w-1/2 text-white pt-10 pb-[36px] md:pb-6 px-6 sm:px-10 md:pl-10 md:pr-[75px] lg:pr-[135px] xl:pr-[165px] flex-col justify-between relative overflow-hidden select-none bg-[#025191]">
          {/* Subtle dark pattern overlay for premium texture depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06)_0%,transparent_60%)] z-0 pointer-events-none" />

          {/* Top Left minimal header details (Target of CSS Selector for exact upper-left alignment) */}
          <div 
            style={{ paddingTop: '3px', paddingLeft: '0px', paddingRight: '0px', paddingBottom: '2px', width: '265px' }}
            className="relative z-10 flex items-center gap-2 self-start w-full max-w-full"
          >
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg shrink-0">
              <DostLogo className="w-10 h-10" />
            </div>
            <div className="flex flex-col text-left font-sans gap-0.5 text-xs xl:text-sm justify-center">
              <span 
                style={{ textAlign: 'left', lineHeight: '15px', paddingLeft: '1px', width: '1978px' }}
                className="font-normal text-white"
              >
                Department of Science and Technology
              </span>
              <span 
                style={{ textAlign: 'left', lineHeight: '15px' }}
                className="font-normal text-white"
              >
                DOST Region V
              </span>
              <span 
                style={{ textAlign: 'left', lineHeight: '15px', fontWeight: 'normal', fontFamily: 'Poppins' }}
                className="font-normal text-white/90"
              >
                Finance and Administrative Services
              </span>
            </div>
          </div>

          {/* Center brand exhibit - flush left, font sizes customized as requested */}
          <div className="relative z-10 my-8 md:my-auto text-left w-full max-w-full">
            <h1 
              style={{ fontSize: '42px' }}
              className="font-bold font-sans tracking-tight leading-none text-white select-none drop-shadow-md"
            >
              OneDOST4U:
            </h1>
            <p 
              style={{ paddingLeft: '1px', paddingRight: '3px', marginLeft: '0px', marginTop: '0px' }}
              className="text-base sm:text-lg md:text-sm lg:text-lg xl:text-xl font-light font-sans tracking-tight text-white/90 leading-normal drop-shadow-xs whitespace-normal xl:whitespace-nowrap animate-fade-in"
            >
              Solutions and Opportunities for All
            </p>
          </div>

          {/* Bottom Panel handles: Website, Phone, Email, Facebook beautifully organized and staying safely inside solid blue */}
          <div className="relative z-10 pt-4 border-t border-white/10 w-full text-white/80 max-w-full md:max-w-md lg:max-w-lg xl:max-w-xl hidden md:block animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-3 text-[11px] lg:text-[12px] xl:text-[12.5px] font-semibold">
              <a href="https://region5.dost.gov.ph" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition cursor-pointer">
                <Globe className="w-4 h-4 shrink-0 text-sky-300" />
                <span className="font-sans truncate">region5.dost.gov.ph</span>
              </a>
              <div className="flex items-center gap-2 hover:text-white transition cursor-pointer">
                <Phone className="w-4 h-4 shrink-0 text-sky-300" />
                <span className="font-sans truncate">09671152307</span>
              </div>
              <a href="mailto:albay@ro5.dost.gov.ph" className="flex items-center gap-2 hover:text-white transition cursor-pointer">
                <Mail className="w-4 h-4 shrink-0 text-sky-300" />
                <span className="font-sans truncate" title="albay@ro5.dost.gov.ph">albay@ro5.dost.gov.ph</span>
              </a>
              <div className="flex items-center gap-2 hover:text-white transition cursor-pointer">
                <Facebook className="w-4 h-4 shrink-0 text-sky-300" />
                <span className="font-sans truncate">DOST-Albay</span>
              </div>
            </div>
          </div>

          {/* Precise wave divider cutting the left backdrop dynamically - overlaps with the right white container */}
          <svg 
            className="absolute top-0 right-0 h-full w-[65px] lg:w-[120px] xl:w-[145px] translate-x-[1px] pointer-events-none z-10 text-[#f8fafc] fill-current hidden md:block"
            viewBox="0 0 250 1000" 
            preserveAspectRatio="none"
          >
            <path d="M170,0 C100,140 10,260 90,420 C170,580 240,680 140,840 C70,950 130,975 250,1000 L250,0 Z" />
          </svg>

          {/* Horizontal curvy divider for mobile stacked layout */}
          <svg 
            className="absolute bottom-0 left-0 w-full h-[24px] translate-y-[1px] pointer-events-none z-10 text-[#f8fafc] fill-current md:hidden"
            viewBox="0 0 1000 100" 
            preserveAspectRatio="none"
          >
            <path d="M0,100 L0,30 C300,60 700,10 1000,100 Z" />
          </svg>
        </div>

        {/* Right Panel: Interactive Google OAuth Entry Portal */}
        <div className="flex-1 flex flex-col justify-between items-center p-6 sm:p-10 md:p-8 lg:p-16 bg-[#f8fafc]">
          
          {/* Centering space helper for desktop size */}
          <div className="hidden md:block flex-1" />

          {/* Main Card */}
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 sm:p-10 font-sans relative my-auto">
            
            <div>
              <h2 className="text-[20px] font-semibold text-slate-800 tracking-tight mt-1 mb-6 font-sans uppercase">
                WELCOME!
              </h2>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-shake font-sans">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span className="leading-snug font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Credentials Login Form */}
            <form onSubmit={handleDirectLoginSubmit} className="space-y-4">
              
              {/* Email Address Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-sans block">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 placeholder-slate-400 text-slate-800 transition duration-150 font-sans shadow-2xs"
                  value={directEmail}
                  onChange={(e) => setDirectEmail(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-sans block">
                  Password
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPasswordMask ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-4 pr-12 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 placeholder-slate-400 text-slate-800 transition duration-150 font-sans shadow-2xs"
                    value={directPassword}
                    onChange={(e) => setDirectPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordMask(!showPasswordMask)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer select-none transition"
                  >
                    {showPasswordMask ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Checkbox "Remember for 30 days" & Link "Forgot password" */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-sans text-slate-500 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4 cursor-pointer"
                  />
                  <span>Remember for 30 days</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[#025191] hover:text-[#025191]/90 font-semibold cursor-pointer font-sans transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#025191] hover:bg-[#025191]/90 text-white font-semibold rounded-xl text-sm transition duration-150 cursor-pointer flex items-center justify-center shadow-md shadow-[#025191]/10 font-sans select-none"
              >
                {loading ? "Authenticating..." : "Sign in"}
              </button>
            </form>

            {/* Google Authentication alternate login button */}
            <div className="relative my-6 select-none font-sans flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative px-3 bg-white text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Or continue with</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setShowAccounts(true);
              }}
              className="w-full h-11 flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-4 rounded-xl transition duration-150 text-sm select-none cursor-pointer font-sans shadow-2xs"
            >
              {/* Google Icon logo */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Footer switcher to register another admin / employee */}
            <div className="mt-8 text-center text-xs text-slate-500 font-sans select-none">
              <span>Don't have an account? </span>
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setIsCreatingCustom(true);
                  setShowAccounts(true);
                }}
                type="button"
                className="text-[#025191] hover:text-[#025191]/90 font-bold transition cursor-pointer font-sans"
              >
                Sign up
              </button>
            </div>

          </div>

          {/* Spacer for desktop layout centering */}
          <div className="hidden md:block flex-1" />

          {/* Social Platforms for Mobile (Phone) Size */}
          <div className="w-full max-w-sm mt-7 pt-5 border-t border-slate-200/60 pb-1 md:hidden text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 font-sans">
              Contact & Support Details
            </p>
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-2.5 text-[10px] sm:text-[11px] font-semibold text-slate-500 justify-center justify-items-center mx-auto w-full max-w-xs px-2">
              <a href="https://region5.dost.gov.ph" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#025191] transition cursor-pointer min-w-0 justify-center">
                <Globe className="w-3.5 h-3.5 shrink-0 text-[#025191]" />
                <span className="font-sans truncate">region5.dost.gov.ph</span>
              </a>
              <div className="flex items-center gap-1.5 hover:text-[#025191] transition min-w-0 justify-center">
                <Phone className="w-3.5 h-3.5 shrink-0 text-[#025191]" />
                <span className="font-sans truncate">09671152307</span>
              </div>
              <a href="mailto:albay@ro5.dost.gov.ph" className="flex items-center gap-1.5 hover:text-[#025191] transition cursor-pointer animate-fade-in min-w-0 justify-center">
                <Mail className="w-3.5 h-3.5 shrink-0 text-[#025191]" />
                <span className="font-sans truncate" title="albay@ro5.dost.gov.ph">albay@ro5.dost.gov.ph</span>
              </a>
              <div className="flex items-center gap-1.5 hover:text-[#025191] transition min-w-0 justify-center">
                <Facebook className="w-3.5 h-3.5 shrink-0 text-[#025191]" />
                <span className="font-sans truncate">DOST-Albay</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Google Real Account Selector Overlay Modal */}
      {showAccounts && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in font-inter">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5 animate-scale-up">
            
            {/* Header Google Identity Branding */}
            <div className="p-6 pb-4 border-b border-slate-100 flex flex-col items-center select-none">
              <div className="flex gap-1.5 items-center justify-center py-1">
                <span className="text-blue-500 font-bold text-xl font-sans">G</span>
                <span className="text-red-500 font-bold text-xl font-sans">o</span>
                <span className="text-yellow-500 font-bold text-xl font-sans">o</span>
                <span className="text-blue-500 font-bold text-xl font-sans">g</span>
                <span className="text-green-500 font-bold text-xl font-sans">l</span>
                <span className="text-red-500 font-bold text-xl font-sans">e</span>
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-2 font-sans">Choose an account</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-inter">
                to continue to <span className="font-semibold text-blue-600">DOST V Finance</span>
              </p>
            </div>

            {loadingAccount ? (
              /* Loading auth transition */
              <div className="p-16 flex flex-col items-center justify-center font-inter">
                <RefreshCw className="w-9 h-9 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-slate-600 mt-4 animate-pulse font-sans">Requesting authorization token...</p>
              </div>
            ) : passwordVerificationAccount ? (
              /* Clearance Password Prompt Screen */
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4 font-inter text-slate-700">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-205/50">
                  <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200/60 flex items-center justify-center font-sans font-black text-sky-800 text-sm">
                    {passwordVerificationAccount.avatar || passwordVerificationAccount.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-none truncate font-sans">{passwordVerificationAccount.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 leading-none truncate">{passwordVerificationAccount.email}</p>
                    <p className="text-[10px] text-[#0c4a6e] font-extrabold uppercase mt-1.5 leading-none tracking-tight font-sans">
                      {passwordVerificationAccount.role}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Workspace Password</label>
                    <span className="text-[9px] text-[#0c4a6e] font-bold font-mono px-1.5 py-0.5 bg-slate-100/80 rounded-md">
                      Test Pass: {ACCOUNT_PASSWORDS[passwordVerificationAccount.email.toLowerCase()] || getCustomPasswords()[passwordVerificationAccount.email.toLowerCase()] || "your key"}
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      autoFocus
                      type={showPasswordMask ? "text" : "password"}
                      placeholder="Enter organizational password..."
                      className="w-full pl-9 pr-14 h-10 border border-slate-250 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-1 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] focus:outline-none placeholder-slate-350"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordMask(!showPasswordMask)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 font-sans cursor-pointer select-none"
                    >
                      {showPasswordMask ? "Hide" : "Show"}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1 animate-pulse font-sans">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordVerificationAccount(null);
                      setPasswordInput('');
                      setPasswordError(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition font-sans"
                  >
                    Back to Accounts
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0c4a6e] hover:bg-[#083550] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 font-sans cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verify Clearance
                  </button>
                </div>
              </form>
            ) : isCreatingCustom ? (
              /* Custom Account Generator for flexibility */
              <form onSubmit={handleCustomSubmit} className="p-6 space-y-4 font-inter">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">Employee Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. m.santos"
                      className="w-full pl-9 pr-48 h-9 border border-slate-250 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono select-none">
                      @region5.dost.gov.ph
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Dr. Maria Santos"
                    className="w-full px-3 h-9 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">Unit Designation</label>
                  <select
                    className="w-full px-3 h-9 border border-slate-250 rounded-lg text-xs font-medium text-slate-700 bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as Role)}
                  >
                    <option value="Budget Officer">Budget Officer (Budget Unit)</option>
                    <option value="Chief Accountant">Chief Accountant (Accounting Unit)</option>
                    <option value="Disbursing Cashier">Disbursing Cashier (Cashiering Unit)</option>
                    <option value="Administrator">Administrator (Regional Director)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">Desk Signature Password</label>
                    <span className="text-[9px] text-slate-400">used to sign transactions</span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="password"
                      placeholder="Enter a custom signature password..."
                      className="w-full pl-9 pr-3 h-9.5 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustom(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                  >
                    Back to Accounts
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0c4a6e] hover:bg-[#083550] text-white text-xs font-bold rounded-lg transition"
                  >
                    Create & Sign On
                  </button>
                </div>
              </form>
            ) : (
              /* Standard Accounts selector */
              <div className="font-inter">
                <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100">
                  {googleAccounts.map((acc, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAccountClick(acc)}
                      type="button"
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-105 flex items-center justify-center font-mono font-bold text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition duration-150 shrink-0">
                          {acc.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 leading-none truncate font-sans">{acc.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono leading-none mt-1 truncate">{acc.email}</p>
                          <p className="text-[10px] text-slate-500 leading-none mt-2 font-semibold uppercase tracking-tight">{acc.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-150 group-hover:bg-blue-50 group-hover:text-blue-650 px-2 py-0.5 rounded transition shrink-0">
                        Select
                      </span>
                    </button>
                  ))}
                </div>

                {/* Switcher to Custom Profile */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setIsCreatingCustom(true)}
                    type="button"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    Use another workspace email
                  </button>
                  <button
                    onClick={() => setShowAccounts(false)}
                    type="button"
                    className="text-slate-500 hover:text-slate-800 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
}
