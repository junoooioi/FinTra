import React, { useState } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { RoleBasedAccess } from '../components/RoleBasedAccess';
import { DocumentStatusTracker } from '../components/DocumentStatusTracker';
import { FileUploadAttachment } from '../components/FileUploadAttachment';
import { ChecklistItem, Document } from '../types';
import { 
  FileText, Plus, ClipboardCheck, ArrowUpRight, 
  HelpCircle, Sparkles, CheckSquare, Save, FolderOpen, AlertCircle,
  Key, ShieldCheck, Eye, EyeOff
} from 'lucide-react';

export const BudgetSectionPage: React.FC = () => {
  const { documents, createDocument, approveBudget, addAttachment, user } = useWorkflow();

  // Signature verification states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signaturePasswordInput, setSignaturePasswordInput] = useState('');
  const [showSignaturePasswordMask, setShowSignaturePasswordMask] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  // Selected document to process
  const [selectedDocId, setSelectedDocId] = useState<string | null>(() => {
    const budgetQueue = documents.filter(d => d.currentSection === 'BUDGET');
    return budgetQueue.length > 0 ? budgetQueue[0].id : null;
  });

  // Intake Form toggle and state
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'PR' | 'DV' | 'PO'>('PR');
  const [newSupplier, setNewSupplier] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [intakeAttachments, setIntakeAttachments] = useState<{ name: string; size: string; dateAdded: string }[]>([]);

  // Selected document processing states
  const [customOrs, setCustomOrs] = useState('');
  const [remarks, setRemarks] = useState('');
  const [currentChecklist, setCurrentChecklist] = useState<ChecklistItem[]>([]);

  // Selected document instance
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  // Sync state whenever a new document is selected
  React.useEffect(() => {
    if (selectedDoc) {
      setRemarks(selectedDoc.budgetRemarks || '');
      setCustomOrs(selectedDoc.orsNumber || '');
      setCurrentChecklist(selectedDoc.budgetChecklist.map(c => ({ ...c })));
    }
  }, [selectedDocId]);

  // Handle Intake Registration Submit
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSupplier || !newAmount) {
      alert("Please fill all fields to generate a registered document.");
      return;
    }

    createDocument({
      title: newTitle,
      type: newType,
      supplier: newSupplier,
      amount: parseFloat(newAmount),
      attachments: intakeAttachments
    });

    // Reset Form
    setNewTitle('');
    setNewSupplier('');
    setNewAmount('');
    setIntakeAttachments([]);
    setShowIntakeForm(false);
    
    // Auto-select latest
    setTimeout(() => {
      const budgetLatest = documents.filter(d => d.currentSection === 'BUDGET');
      if (budgetLatest.length > 0) {
        setSelectedDocId(documents[0].id); // First in index is latest added
      }
    }, 100);
  };

  // Systematic ORS Code Generator
  const generateOrsCode = () => {
    if (!selectedDoc) return;
    const yearMonth = new Date().toISOString().substring(0, 7).replace('-', '-');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    setCustomOrs(`ORS-${yearMonth}-${randomSeq}`);
  };

  // Toggle checklist item
  const handleToggleChecklist = (id: string) => {
    setCurrentChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // Check if all checklist items are ticked for safety validation
  const isChecklistComplete = currentChecklist.length > 0 && currentChecklist.every(i => i.checked);

  const handleForwardToAccounting = () => {
    if (!selectedDoc) return;
    if (!customOrs) {
      alert("Verification Rejected: System requires a generated Obligation Request and Status (ORS) code before routing forward.");
      return;
    }

    // Reset password dialog
    setSignaturePasswordInput('');
    setShowSignaturePasswordMask(false);
    setSignatureError(null);
    setShowSignatureModal(true);
  };

  const handleVerifySignatureAndForward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    // Retrieve valid comparison passwords
    const standardPasswords: Record<string, string> = {
      'maria.santos@region5.dost.gov.ph': 'budget123',
      'loislainalcantara@gmail.com': 'admin123'
    };

    // Load custom passwords
    let correctPassword = 'budget123'; // global role default for Budget Officer
    if (user) {
      const emailLower = user.email.toLowerCase();
      if (standardPasswords[emailLower]) {
        correctPassword = standardPasswords[emailLower];
      } else {
        // Read custom password
        try {
          const stored = localStorage.getItem('dost_custom_credentials');
          const customMap = stored ? JSON.parse(stored) : {};
          if (customMap[emailLower]) {
            correctPassword = customMap[emailLower];
          } else {
            // Check session storage signature
            const sessionSigned = sessionStorage.getItem('dost_session_signed_pass');
            if (sessionSigned) {
              correctPassword = sessionSigned;
            }
          }
        } catch {
          // ignore
        }
      }
    }

    if (signaturePasswordInput !== correctPassword && signaturePasswordInput !== 'budget123') {
      setSignatureError("Verification Failed: Secure administrative signature key is incorrect.");
      return;
    }

    // Success: Execute Workflow state change
    approveBudget(selectedDoc.id, {
      orsNumber: customOrs,
      remarks: remarks || 'Funds obligated under local budget accounts. Clearance forwarded.',
      checklist: currentChecklist
    });

    alert(`Security Signature Applied. Transferred ${selectedDoc.id} successfully to Chief Accountant desk inbox.`);
    setShowSignatureModal(false);
    
    // Select next item down
    const remaining = documents.filter(d => d.currentSection === 'BUDGET' && d.id !== selectedDoc.id);
    if (remaining.length > 0) {
      setSelectedDocId(remaining[0].id);
    } else {
      setSelectedDocId(null);
    }
  };

  const activeBudgetQueue = documents.filter(d => d.currentSection === 'BUDGET');

  return (
    <RoleBasedAccess allowedRoles={['Budget Officer']}>
      <div className="space-y-6">
        {/* Hub Title Banner */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-tech-accent font-bold text-xs uppercase font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-tech-accent animate-ping" />
              Department: Finance & Administrative Services
            </div>
            <h1 className="font-sans font-black text-xl text-slate-800 tracking-tight mt-1">
              Budget Allocation & Obligation Desk
            </h1>
            <p className="text-xs text-slate-400">Review purchase requests, authenticate available allocations, register ORS ledger codes, and forward validated items to Chief Accountant</p>
          </div>

          <button
            id="open_intake_drawer_btn"
            onClick={() => setShowIntakeForm(!showIntakeForm)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" />
            {showIntakeForm ? 'View Queue Ledger' : 'Register New Intake Document'}
          </button>
        </div>

        {/* Intake Document Form Toggle Module */}
        {showIntakeForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-tech-accent" />
              Government Document Intake Registration
            </h3>
            
            <form onSubmit={handleIntakeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1.5">
                <label className="text-xs uppercase">Document Name / Brief Purpose</label>
                <input
                  id="intake_title_input"
                  type="text"
                  placeholder="e.g. Procurement of Security uniforms / Catering services"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-tech-accent focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase">Intake Category</label>
                <select
                  id="intake_type_select"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer font-bold text-slate-700"
                >
                  <option value="PR">PR (Purchase Request)</option>
                  <option value="DV">DV (Disbursement Voucher)</option>
                  <option value="PO">PO (Purchase Order)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase">Supplier / Creditor Beneficiary</label>
                <input
                  id="intake_supplier_input"
                  type="text"
                  placeholder="e.g. ShieldGuard / Prime Stationeries"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-tech-accent focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase">Gross Value / Obligation Amount (PHP)</label>
                <input
                  id="intake_amount_input"
                  type="number"
                  placeholder="e.g. 15000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-tech-accent focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="md:col-span-2 border-t border-slate-100 pt-3">
                <label className="text-xs uppercase block mb-1.5">Attach Proof of Request / Compliance Paperwork</label>
                <FileUploadAttachment
                  attachments={intakeAttachments}
                  onAddAttachment={(name, size) => {
                    setIntakeAttachments(prev => [...prev, { name, size, dateAdded: 'Today' }]);
                  }}
                  onRemoveAttachment={(name) => {
                    setIntakeAttachments(prev => prev.filter(a => a.name !== name));
                  }}
                />
              </div>

              <div className="md:col-span-2 pt-3 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowIntakeForm(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleIntakeSubmit}
                  className="px-4 py-2 bg-tech-accent text-white font-bold rounded-lg hover:bg-tech-accent-hover transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Authenticate & File Entry
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Column Processing Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Waiting Budget Queue list */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-sans font-bold text-slate-700 text-xs uppercase flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-tech-accent" />
                  Budget Desk Queue ({activeBudgetQueue.length})
                </h4>
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {activeBudgetQueue.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <p className="font-semibold">Queue is clear!</p>
                    <p className="text-[10px] mt-1">All registered documents obligations have been mapped and forwarded.</p>
                  </div>
                ) : (
                  activeBudgetQueue.map((doc) => {
                    const isSelected = doc.id === selectedDocId;
                    const isReturned = doc.status === 'ACCOUNTING_RETURNED';

                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full p-4 flex flex-col gap-1 text-left transition select-none ${
                          isSelected ? 'bg-blue-50/60 border-l-4 border-tech-accent' : 'hover:bg-slate-50/40 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono font-bold text-xs text-tech-accent truncate w-24">
                            {doc.id}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-tight uppercase ${
                            isReturned ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isReturned ? 'Returned' : doc.type}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{doc.title}</h5>
                        <p className="text-[10px] text-slate-400 line-clamp-1">Supplier: {doc.supplier}</p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono text-slate-600 font-bold text-xs">₱{doc.amount.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400">{doc.dateCreated}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Document Processing Area */}
          <div className="lg:col-span-8">
            {selectedDoc ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
                
                {/* Header Profile */}
                <div className="border-b border-blue-50 pb-4 flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 uppercase tracking-wide font-mono">
                      Category: {selectedDoc.type} Desk Review
                    </span>
                    <h2 className="font-sans font-black text-lg text-slate-800 tracking-tight mt-1">{selectedDoc.title}</h2>
                    <p className="text-xs text-slate-400">Recipient: <span className="font-semibold text-slate-600">{selectedDoc.supplier}</span> • Est. Cost: <span className="font-mono font-black text-slate-700">₱{selectedDoc.amount.toLocaleString()}</span></p>
                  </div>
                  <div>
                    <span className="p-1 px-2.5 bg-blue-50 border border-blue-150 rounded-lg text-xs font-bold font-mono text-tech-accent">
                      ID: {selectedDoc.id}
                    </span>
                  </div>
                </div>

                {/* Returned Alert display */}
                {selectedDoc.status === 'ACCOUNTING_RETURNED' && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-xs flex gap-2">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Returned by Audit Accountant:</p>
                      <p className="text-rose-700 font-medium italic mt-0.5">"{selectedDoc.accountingRemarks}"</p>
                    </div>
                  </div>
                )}

                {/* Progress Visual Timeline Tracker */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Process Step Progress Status</h4>
                  <DocumentStatusTracker document={selectedDoc} />
                </div>

                {/* Completeness Checklist Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ClipboardCheck className="w-4 h-4 text-tech-accent" />
                    Completeness & Legality checklist verifies:
                  </h4>
                  <p className="text-[10px] text-slate-400 mb-2">Check each physical compliance document to verify submission completeness before assigning system codes.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                    {currentChecklist.map((item) => (
                      <label 
                        key={item.id} 
                        className={`p-2.5 rounded-lg border transition flex items-start gap-2.5 cursor-pointer select-none ${
                          item.checked ? 'border-blue-100 bg-blue-50/20 text-blue-900' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleChecklist(item.id)}
                          className="mt-0.5 w-3.5 h-3.5 text-tech-accent bg-slate-150 border-slate-300 rounded focus:ring-tech-accent focus:outline-none"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ORS Generator display */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-605 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-tech-accent" />
                    Obligation Request & Status (ORS) code mapping
                  </h4>
                  <p className="text-[10px] text-slate-400 mb-2">Systematic indexing connects the item to available municipal/regional funds.</p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        id="ors_code_input"
                        type="text"
                        placeholder="e.g. ORS-2026-06-0382"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tech-accent"
                        value={customOrs}
                        onChange={(e) => setCustomOrs(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateOrsCode}
                      className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-150 text-tech-accent rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 flex-shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Sequential ID
                    </button>
                  </div>
                </div>

                {/* Transaction Encoder Remarks Form */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-tech-accent" />
                    Transaction encoding notes
                  </h4>
                  <textarea
                    id="budget_remarks_textarea"
                    placeholder="Enter observations, allotment classifications or budget remarks to guide the accountant..."
                    className="w-full h-16 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tech-accent focus:bg-white transition"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                {/* File Attachment addition center */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document uploads</h4>
                  <FileUploadAttachment
                    attachments={selectedDoc.attachments}
                    onAddAttachment={(name, size) => addAttachment(selectedDoc.id, name, size)}
                  />
                </div>

                {/* Final dispatch zone */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wide font-bold">Certification checkpoint</p>
                    <p className="text-xs text-slate-500">
                      {isChecklistComplete ? (
                        <span className="text-emerald-600 font-semibold">✓ Ready to dispatch (Checklist completely checked)</span>
                      ) : (
                        <span className="text-amber-500 font-semibold">⚠ Caution: Complete compliance checklists before forwarding</span>
                      )}
                    </p>
                  </div>

                  <button
                    id="forward_to_accounting_btn"
                    onClick={handleForwardToAccounting}
                    className={`px-4.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow ${
                      isChecklistComplete && customOrs
                        ? 'bg-tech-accent hover:bg-tech-accent-hover text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-150'
                    }`}
                  >
                    Forward to Accounting Section
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm text-slate-400">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-sans font-bold text-base text-slate-800 tracking-tight">Select / Create Intake Document</h3>
                <p className="text-xs max-w-sm mx-auto mt-1">
                  Please pick any budget allocations file on the left menu queue list to initiate verification checkpoints, or register a new intake above!
                </p>
              </div>
            )}
          </div>

        </div>
        {/* Google Signature password clearance popup */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 ring-1 ring-black/5 space-y-4 text-left">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-sky-50 text-[#0c4a6e] border border-sky-100 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-black text-slate-850 tracking-tight uppercase text-xs">Verify Digital Signature</h4>
                  <p className="text-[10px] text-slate-400">Authenticating authorization clearance</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Applying digital signature certification to transfer <span className="font-semibold text-slate-700">{selectedDoc?.id}</span> to the Chief Accountant desk. Please verify your workspace password.
              </p>

              <form onSubmit={handleVerifySignatureAndForward} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                    <span>Administrative Signature Key</span>
                    <span className="text-[#0c4a6e] font-mono px-1.5 py-0.5 bg-slate-100 rounded">
                      Demo Key: budget123
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      autoFocus
                      type={showSignaturePasswordMask ? "text" : "password"}
                      placeholder="Enter organizational password..."
                      className="w-full pl-9 pr-12 h-10 border border-slate-205 rounded-xl text-xs focus:ring-1 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] focus:outline-none"
                      value={signaturePasswordInput}
                      onChange={(e) => setSignaturePasswordInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignaturePasswordMask(!showSignaturePasswordMask)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer select-none"
                    >
                      {showSignaturePasswordMask ? "Hide" : "Show"}
                    </button>
                  </div>
                  {signatureError && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1 animate-pulse font-sans">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {signatureError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignatureModal(false);
                      setSignaturePasswordInput('');
                      setSignatureError(null);
                    }}
                    className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold transition font-sans cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0c4a6e] hover:bg-[#083550] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 font-sans cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Sign & Forward
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </RoleBasedAccess>
  );
};
