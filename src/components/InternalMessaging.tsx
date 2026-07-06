import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { db } from '../firebase';
import { collection, doc, addDoc, deleteDoc, onSnapshot, query, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { InternalMessage, Role, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, X, ChevronDown, Wrench, Sparkles, 
  Clock, Check, CheckCheck, Users, ArrowLeft, Search, Trash2, Shield, Info, Bell, User as UserIcon
} from 'lucide-react';

// Indo Teknik theme-compliant role metadata
const roleMeta: Record<Role, { label: string; bg: string; text: string; iconBg: string; short: string }> = {
  SA: { label: 'Service Advisor', bg: 'bg-blue-600/15 text-blue-400 border border-blue-500/20', text: 'text-blue-400', iconBg: 'bg-blue-600', short: 'SA' },
  MECHANIC: { label: 'Mekanik', bg: 'bg-amber-500/15 text-amber-400 border border-amber-500/20', text: 'text-amber-400', iconBg: 'bg-amber-600', short: 'MK' },
  COMMON_RAIL: { label: 'Lab Common Rail', bg: 'bg-purple-500/15 text-purple-400 border border-purple-500/20', text: 'text-purple-400', iconBg: 'bg-purple-600', short: 'CR' },
  FOREMAN: { label: 'Foreman', bg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', text: 'text-emerald-400', iconBg: 'bg-emerald-600', short: 'FM' },
  ADMIN: { label: 'Admin/Manager', bg: 'bg-red-500/15 text-red-400 border border-red-500/20', text: 'text-red-400', iconBg: 'bg-red-600', short: 'AD' },
  CUSTOMER: { label: 'Konsumen', bg: 'bg-slate-500/15 text-slate-400 border border-slate-500/20', text: 'text-slate-400', iconBg: 'bg-slate-600', short: 'CS' }
};

export const InternalMessaging: React.FC = () => {
  const { currentUser, workOrders, users } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedWOId, setSelectedWOId] = useState('');
  
  // Tab states: 'ROOMS' (Group & Units), 'DIRECT' (Private/Pesan Pribadi), 'STATUS' (System & TTL Info)
  const [activeTab, setActiveTab] = useState<'ROOMS' | 'DIRECT' | 'STATUS'>('ROOMS');
  
  // Active room ID: 'ALL' (Global), 'ROLE_[Role]' (Division group), 'WO_[woId]' (Vehicle Unit), or standard '[userId]' (Direct message)
  const [activeRoomId, setActiveRoomId] = useState<string>('ALL');
  
  const [contactSearch, setContactSearch] = useState('');
  const [isCleaning, setIsCleaning] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  // Helper to check if a message belongs to a specific room
  const isMessageInRoom = (msg: InternalMessage, roomId: string): boolean => {
    if (roomId === 'GLOBAL') {
      return msg.recipientId === 'GLOBAL' || msg.recipientId === 'ALL' || !msg.recipientId;
    } else if (roomId.startsWith('ROLE_')) {
      return msg.recipientId === roomId;
    } else if (roomId.startsWith('WO_')) {
      return msg.recipientId === roomId || msg.relatedWOId === roomId.replace('WO_', '');
    } else {
      // Direct message
      return (
        (msg.senderId === currentUser.id && msg.recipientId === roomId) ||
        (msg.senderId === roomId && msg.recipientId === currentUser.id)
      );
    }
  };

  // Derive unread counts dynamically based on messages in real-time
  const unreadCounts = React.useMemo(() => {
    if (!currentUser) return {};
    const counts: Record<string, number> = {};
    
    messages.forEach((msg) => {
      // Skip our own messages
      if (msg.senderId === currentUser.id) return;
      
      // Check if read by us
      const isRead = msg.readBy && msg.readBy.includes(currentUser.id);
      if (isRead) return;

      // Determine which room this message belongs to
      if (msg.recipientId === 'ALL' || msg.recipientId === 'GLOBAL' || !msg.recipientId) {
        counts['GLOBAL'] = (counts['GLOBAL'] || 0) + 1;
      } else if (msg.recipientId.startsWith('ROLE_')) {
        if (msg.recipientId === `ROLE_${currentUser.role}`) {
          counts[msg.recipientId] = (counts[msg.recipientId] || 0) + 1;
        }
      } else if (msg.recipientId.startsWith('WO_')) {
        counts[msg.recipientId] = (counts[msg.recipientId] || 0) + 1;
      } else if (msg.recipientId === currentUser.id) {
        // Direct message to me - belongs to the sender's room (senderId)
        counts[msg.senderId] = (counts[msg.senderId] || 0) + 1;
      }
    });

    return counts;
  }, [messages, currentUser?.id, currentUser?.role]);

  // Get current local date string (YYYY-MM-DD)
  const getLocalDateKey = () => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().split('T')[0];
  };

  const todayKey = getLocalDateKey();

  // Run auto-pruning to keep Firestore clean (remove anything older than today)
  useEffect(() => {
    if (!currentUser) return;

    const performPrune = async () => {
      try {
        const q = query(collection(db, 'internalMessages'));
        const snapshot = await getDocs(q);
        let deletedCount = 0;
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          if (!data.dateKey || data.dateKey !== todayKey) {
            await deleteDoc(doc(db, 'internalMessages', docSnap.id));
            deletedCount++;
          }
        }
        if (deletedCount > 0) {
          console.log(`[ERP Message Pruner] Cleaned up ${deletedCount} yesterday/old messages successfully.`);
        }
      } catch (err: any) {
        console.warn('Auto-pruning skipped or pending database sync:', err.message);
      }
    };

    performPrune();
  }, [currentUser, todayKey]);

  // Subscribe to messages in real-time unconditionally
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'internalMessages'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: InternalMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as InternalMessage);
      });

      // Sort messages locally by timestamp/createdAtMs ascending
      msgs.sort((a, b) => a.createdAtMs - b.createdAtMs);
      
      // Filter out messages older than 24 hours to enforce TTL strictly in client
      const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
      const recentMsgs = msgs.filter(m => m.createdAtMs >= cutoffTime);
      
      setMessages(recentMsgs);
    }, (error) => {
      console.warn('Firestore messages subscription warning:', error.message);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Automatically mark unread messages in active room as read by current user
  useEffect(() => {
    if (!isOpen || !activeRoomId || !currentUser || messages.length === 0) return;

    const markAsRead = async () => {
      const unreadInActiveRoom = messages.filter((msg) => {
        if (msg.senderId === currentUser.id) return false;
        const isRead = msg.readBy && msg.readBy.includes(currentUser.id);
        if (isRead) return false;
        
        return isMessageInRoom(msg, activeRoomId);
      });

      if (unreadInActiveRoom.length === 0) return;

      try {
        const promises = unreadInActiveRoom.map((msg) =>
          updateDoc(doc(db, 'internalMessages', msg.id), {
            readBy: arrayUnion(currentUser.id)
          })
        );
        await Promise.all(promises);
      } catch (err) {
        console.warn('Failed to update read receipts:', err);
      }
    };

    // Debounce slightly to allow UI transitions to complete smoothly
    const timer = setTimeout(() => {
      markAsRead();
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, activeRoomId, messages, currentUser]);

  // Auto-scroll to bottom on room change or new messages
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  }, [isOpen, messages, activeRoomId]);

  if (!currentUser) return null;

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Find linked work order details
    let plateNo = '';
    if (selectedWOId) {
      const wo = workOrders.find((w) => w.id === selectedWOId);
      if (wo) {
        plateNo = wo.plateNumber || '';
      }
    }

    let recipientId = activeRoomId;
    let recipientName = 'Grup';
    let recipientRole: Role | 'ALL' = 'ALL';

    if (activeRoomId === 'GLOBAL' || activeRoomId === 'ALL') {
      recipientId = 'GLOBAL';
      recipientName = 'Semua Tim';
      recipientRole = 'ALL';
    } else if (activeRoomId.startsWith('ROLE_')) {
      const roleStr = activeRoomId.replace('ROLE_', '') as Role;
      recipientId = activeRoomId;
      recipientName = `Grup ${roleMeta[roleStr]?.label || roleStr}`;
      recipientRole = roleStr;
    } else if (activeRoomId.startsWith('WO_')) {
      const woId = activeRoomId.replace('WO_', '');
      const woObj = workOrders.find(w => w.id === woId);
      recipientId = activeRoomId;
      recipientName = `Unit ${woObj?.plateNumber || 'SPK'}`;
      recipientRole = 'ALL';
      // Automatically link this WO
      if (!selectedWOId) {
        plateNo = woObj?.plateNumber || '';
      }
    } else {
      // Direct message to a specific user
      const targetUser = users.find(u => u.id === activeRoomId);
      recipientId = activeRoomId;
      recipientName = targetUser?.name || 'User';
      recipientRole = targetUser?.role || 'MECHANIC';
    }

    const messageData = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientId,
      recipientName,
      recipientRole,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      createdAtMs: Date.now(),
      relatedWOId: selectedWOId || (activeRoomId.startsWith('WO_') ? activeRoomId.replace('WO_', '') : ''),
      relatedPlateNumber: plateNo || (activeRoomId.startsWith('WO_') ? workOrders.find(w => w.id === activeRoomId.replace('WO_',''))?.plateNumber : ''),
      dateKey: todayKey
    };

    try {
      await addDoc(collection(db, 'internalMessages'), messageData);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Filter contacts (excluding me, showing those who aren't suspended)
  const activeContacts = users.filter((u) => u.status !== 'SUSPENDED' && u.id !== currentUser.id);
  
  // Filter contacts based on contactSearch query
  const filteredContacts = activeContacts.filter((u) => 
    u.name.toLowerCase().includes(contactSearch.toLowerCase()) || 
    (roleMeta[u.role]?.label || u.role).toLowerCase().includes(contactSearch.toLowerCase())
  );

  // Active room messages local filtering
  const activeRoomMessages = messages.filter((msg) => {
    if (activeRoomId === 'GLOBAL' || activeRoomId === 'ALL') {
      return msg.recipientId === 'GLOBAL' || msg.recipientId === 'ALL' || !msg.recipientId;
    } else if (activeRoomId.startsWith('ROLE_')) {
      return msg.recipientId === activeRoomId;
    } else if (activeRoomId.startsWith('WO_')) {
      return msg.recipientId === activeRoomId || msg.relatedWOId === activeRoomId.replace('WO_', '');
    } else {
      // Direct message: sender is me and recipient is target OR sender is target and recipient is me
      return (
        (msg.senderId === currentUser.id && msg.recipientId === activeRoomId) ||
        (msg.senderId === activeRoomId && msg.recipientId === currentUser.id)
      );
    }
  });

  // Calculate total unread count for the FAB badge
  const totalUnread = Object.keys(unreadCounts).reduce((sum: number, key: string) => sum + (unreadCounts[key] || 0), 0);

  // Helper to find the last message and timestamp for preview
  const getLastMessageInfo = (roomId: string) => {
    const roomMsgs = messages.filter((msg) => {
      if (roomId === 'ALL' || roomId === 'GLOBAL') {
        return msg.recipientId === 'ALL' || msg.recipientId === 'GLOBAL' || !msg.recipientId;
      } else if (roomId.startsWith('ROLE_')) {
        return msg.recipientId === roomId;
      } else if (roomId.startsWith('WO_')) {
        return msg.recipientId === roomId || msg.relatedWOId === roomId.replace('WO_', '');
      } else {
        return (
          (msg.senderId === currentUser.id && msg.recipientId === roomId) ||
          (msg.senderId === roomId && msg.recipientId === currentUser.id)
        );
      }
    });

    if (roomMsgs.length === 0) return { text: 'Belum ada pesan koordinasi', time: '' };
    const last = roomMsgs[roomMsgs.length - 1];
    const prefix = last.senderId === currentUser.id ? 'Anda: ' : `${last.senderName}: `;
    const formattedTime = new Date(last.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    return {
      text: `${prefix}${last.text}`,
      time: formattedTime
    };
  };

  // Clean all messages older than 24 hours manually
  const handleManualPrune = async () => {
    setIsCleaning(true);
    try {
      const q = query(collection(db, 'internalMessages'));
      const snapshot = await getDocs(q);
      const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
      let deletedCount = 0;
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.createdAtMs < cutoffTime) {
          await deleteDoc(doc(db, 'internalMessages', docSnap.id));
          deletedCount++;
        }
      }
      alert(`Berhasil membersihkan ${deletedCount} pesan yang sudah melewati batas 24 jam.`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCleaning(false);
    }
  };

  // Active room details
  let activeRoomTitle = 'Semua Tim';
  let activeRoomSubtitle = 'Grup Koordinasi Umum';
  let activeRoomIcon = <Users className="w-5 h-5 text-blue-400" />;

  if (activeRoomId.startsWith('ROLE_')) {
    const r = activeRoomId.replace('ROLE_', '') as Role;
    activeRoomTitle = `Grup ${roleMeta[r]?.label || r}`;
    activeRoomSubtitle = 'Diskusi Khusus Divisi';
    activeRoomIcon = <Users className="w-5 h-5 text-amber-400" />;
  } else if (activeRoomId.startsWith('WO_')) {
    const woId = activeRoomId.replace('WO_', '');
    const woObj = workOrders.find(w => w.id === woId);
    activeRoomTitle = woObj ? `${woObj.plateNumber}` : 'Diskusi Unit';
    activeRoomSubtitle = woObj ? `${woObj.vehicleBrand} - ${woObj.customerName}` : 'Tautan Perbaikan Unit';
    activeRoomIcon = <Wrench className="w-5 h-5 text-red-500 animate-pulse" />;
  } else if (activeRoomId !== 'ALL') {
    const targetUser = users.find(u => u.id === activeRoomId);
    activeRoomTitle = targetUser?.name || 'Staff Member';
    activeRoomSubtitle = targetUser ? (roleMeta[targetUser.role]?.label || targetUser.role) : 'Indo Teknik Staff';
    activeRoomIcon = <UserIcon className="w-5 h-5 text-slate-300" />;
  }

  return (
    <div className="font-sans print:hidden">
      {/* Floating Action Button (Vibrant Indo Teknik Navy with Red Pulse Badge) - Positioned in bottom-right for maximum intuitive visibility */}
      <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[99]">
        <motion.button
          id="workshop-chat-fab"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-[#0F2D59] hover:bg-[#153a70] text-white p-3 md:pl-4 md:pr-5 md:py-3 rounded-full shadow-2xl border border-blue-400/20 font-extrabold transition-all text-sm cursor-pointer relative"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-3.5 -right-3.5 bg-[#E21F26] text-white rounded-full text-[10px] w-5.5 h-5.5 flex items-center justify-center font-black animate-bounce shadow-md border border-slate-900">
                {totalUnread}
              </span>
            )}
          </div>
          <span className="hidden md:inline">Chat Workshop</span>

          <span className="flex h-2 w-2 rounded-full bg-red-500 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          </span>
        </motion.button>
      </div>

      {/* Backdrop overlay on mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 z-[98] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Messaging Panel/Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 pointer-events-none z-[99] flex items-end justify-end">
            <motion.div
              id="workshop-chat-panel"
              initial={{ 
                opacity: 0, 
                y: window.innerWidth < 768 ? '100%' : 120,
                scale: window.innerWidth < 768 ? 1 : 0.96
              }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1
              }}
              exit={{ 
                opacity: 0, 
                y: window.innerWidth < 768 ? '100%' : 120,
                scale: window.innerWidth < 768 ? 1 : 0.96
              }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="pointer-events-auto w-full md:w-[460px] h-[85vh] md:h-[660px] bg-[#0c1220] border-t md:border border-slate-800 rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden fixed inset-x-0 bottom-0 md:bottom-24 md:right-6 md:left-auto"
            >
              {/* BRAND HEADER SECTION (Polished Indo Teknik Navy & Red styling) */}
              <div className="bg-gradient-to-r from-[#0F2D59] to-[#0a1b33] text-white shrink-0 p-4 border-b border-slate-800 relative overflow-hidden">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 md:hidden" />
                <div className="absolute right-0 top-0 w-32 h-32 bg-[#E21F26]/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Return back button */}
                    {activeRoomId !== 'ALL' && (
                      <button
                        onClick={() => setActiveRoomId('ALL')}
                        className="p-1.5 hover:bg-slate-800/80 rounded-xl transition-all mr-1 cursor-pointer text-slate-300 hover:text-white"
                        title="Kembali ke Menu"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    
                    <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl shadow-inner">
                      {activeRoomIcon}
                    </div>
                    <div>
                      <h3 className="font-black text-sm tracking-tight leading-none text-white flex items-center gap-1.5">
                        {activeRoomTitle}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-extrabold mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E21F26] animate-pulse"></span>
                        {activeRoomSubtitle}
                      </p>
                    </div>
                  </div>

                  {/* Close drawer button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white p-2 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* WHATSAPP-STYLE MENU NAVIGATION (Only shown when not in a sub-chat) */}
                {activeRoomId === 'ALL' && (
                  <div className="flex mt-4 bg-slate-950/40 p-1 rounded-xl border border-slate-800/40">
                    <button
                      onClick={() => setActiveTab('ROOMS')}
                      className={`flex-1 text-center py-2 text-xs font-black transition-all rounded-lg ${
                        activeTab === 'ROOMS'
                          ? 'bg-[#0F2D59] text-white shadow-md border border-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      💬 Grup & Unit
                    </button>
                    <button
                      onClick={() => setActiveTab('DIRECT')}
                      className={`flex-1 text-center py-2 text-xs font-black transition-all rounded-lg relative ${
                        activeTab === 'DIRECT'
                          ? 'bg-[#0F2D59] text-white shadow-md border border-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      👤 Kontak Staff
                      {totalUnread > (unreadCounts['GLOBAL'] || 0) && (
                        <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#E21F26]" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('STATUS')}
                      className={`flex-1 text-center py-2 text-xs font-black transition-all rounded-lg ${
                        activeTab === 'STATUS'
                          ? 'bg-[#0F2D59] text-white shadow-md border border-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      📅 Riwayat
                    </button>
                  </div>
                )}
              </div>

              {/* CHAT CHANNELS / ACTIVE CONVERSATION BODY */}
              <div className="flex-1 flex flex-col overflow-hidden bg-[#070b13]">
                
                {activeRoomId === 'ALL' ? (
                  /* ======================================================== */
                  /* A. NAVIGATION LIST (Grup, Contacts Directory, or Stats)   */
                  /* ======================================================== */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* 1. ROOMS TAB: Division groups & active SPK/Vehicle threads */}
                    {activeTab === 'ROOMS' && (
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        
                        {/* Global Chat Group */}
                        <div className="space-y-1.5">
                          <p className="px-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Wadah Koordinasi Utama</p>
                          <div
                            onClick={() => {
                              setActiveRoomId('GLOBAL');
                            }}
                            className="p-3 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/60 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                <Users className="w-5 h-5" />
                              </div>
                              <div className="space-y-1 overflow-hidden">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-xs text-slate-200">Semua Tim (Grup Koordinasi)</span>
                                  <span className="text-[8px] font-black uppercase bg-[#E21F26] text-white px-1.5 py-0.2 rounded border border-red-500/10">UTAMA</span>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate max-w-[210px] font-medium">
                                  {getLastMessageInfo('GLOBAL').text}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[9px] font-bold text-slate-500">{getLastMessageInfo('GLOBAL').time}</span>
                              {unreadCounts['GLOBAL'] > 0 && (
                                <span className="bg-[#E21F26] text-white rounded-full text-[9px] px-2 py-0.5 font-black animate-pulse">
                                  {unreadCounts['GLOBAL']}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Division Group */}
                        <div className="space-y-1.5 pt-1">
                          <p className="px-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Grup Divisi Peran</p>
                          <div
                            onClick={() => setActiveRoomId(`ROLE_${currentUser.role}`)}
                            className="p-3 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/60 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                                <Users className="w-5 h-5" />
                              </div>
                              <div className="space-y-1 overflow-hidden">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-xs text-slate-200">Divisi {roleMeta[currentUser.role]?.label || currentUser.role}</span>
                                  <span className="text-[8px] font-black uppercase bg-amber-500/15 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20">DIVISI</span>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate max-w-[210px] font-medium">
                                  {getLastMessageInfo(`ROLE_${currentUser.role}`).text}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[9px] font-bold text-slate-500">{getLastMessageInfo(`ROLE_${currentUser.role}`).time}</span>
                              {unreadCounts[`ROLE_${currentUser.role}`] > 0 && (
                                <span className="bg-amber-500 text-slate-950 rounded-full text-[9px] px-2 py-0.5 font-black">
                                  {unreadCounts[`ROLE_${currentUser.role}`]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Active Vehicle/SPK Discussions */}
                        <div className="space-y-1.5 pt-2">
                          <p className="px-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-red-500" /> Diskusi Unit SPK Aktif
                          </p>
                          
                          {workOrders.filter(w => !w.isArchived).length === 0 ? (
                            <div className="p-4 text-center text-slate-600 text-xs font-bold border border-dashed border-slate-800 rounded-xl">
                              Belum ada kendaraan aktif di workshop
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {workOrders
                                .filter((wo) => !wo.isArchived)
                                .map((wo) => {
                                  const roomId = `WO_${wo.id}`;
                                  const msgInfo = getLastMessageInfo(roomId);
                                  
                                  return (
                                    <div
                                      key={wo.id}
                                      onClick={() => setActiveRoomId(roomId)}
                                      className="p-3 bg-slate-950/60 hover:bg-slate-900/70 border border-slate-800/40 hover:border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                                    >
                                      <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                                          <span className="text-[8px] font-black text-slate-500">UNIT</span>
                                          <span className="text-[10px] font-black text-red-400 -mt-1">{wo.plateNumber.slice(-3).toUpperCase()}</span>
                                        </div>
                                        <div className="space-y-0.5 overflow-hidden">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-extrabold text-xs text-slate-200">{wo.plateNumber}</span>
                                            <span className="text-[8px] font-extrabold text-slate-400 truncate max-w-[110px]">{wo.customerName}</span>
                                          </div>
                                          <p className="text-[10px] text-slate-500 truncate max-w-[220px] font-semibold">
                                            {msgInfo.text}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-end gap-1 shrink-0 ml-1">
                                        <span className="text-[8px] font-bold text-slate-600">{msgInfo.time}</span>
                                        {unreadCounts[roomId] > 0 && (
                                          <span className="bg-[#E21F26] text-white rounded-full text-[8px] px-1.5 py-0.5 font-black animate-pulse">
                                            {unreadCounts[roomId]}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* 2. DIRECT TAB: Searchable directory list of staff */}
                    {activeTab === 'DIRECT' && (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Search Bar */}
                        <div className="p-3 border-b border-slate-900 bg-slate-950/30">
                          <div className="relative">
                            <input
                              type="text"
                              value={contactSearch}
                              onChange={(e) => setContactSearch(e.target.value)}
                              placeholder="Cari mekanik, foreman, advisor..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                            />
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            {contactSearch && (
                              <button onClick={() => setContactSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Contacts List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                          <p className="px-2.5 py-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Daftar Kontak Staff ({filteredContacts.length})</p>
                          
                          {filteredContacts.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-xs font-bold">
                              Tidak ada staff ditemukan
                            </div>
                          ) : (
                            filteredContacts.map((u) => {
                              const meta = roleMeta[u.role] || { label: u.role, bg: 'bg-slate-800 text-slate-200', text: 'text-slate-300', iconBg: 'bg-slate-600', short: 'US' };
                              const msgInfo = getLastMessageInfo(u.id);

                              return (
                                <div
                                  key={u.id}
                                  onClick={() => setActiveRoomId(u.id)}
                                  className="p-3 hover:bg-slate-900/60 rounded-xl flex items-center justify-between cursor-pointer transition-all border border-transparent hover:border-slate-800/40 my-0.5"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-10 h-10 rounded-full ${meta.bg} flex items-center justify-center text-xs font-black uppercase text-white shrink-0 shadow-sm`}>
                                      {u.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="space-y-0.5 overflow-hidden">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-extrabold text-xs text-slate-200">{u.name}</span>
                                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.2 rounded ${meta.bg}`}>
                                          {meta.short}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 truncate max-w-[210px] font-medium">
                                        {msgInfo.text}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-1 shrink-0 ml-1">
                                    <span className="text-[8px] font-bold text-slate-600">{msgInfo.time}</span>
                                    {unreadCounts[u.id] > 0 && (
                                      <span className="bg-[#E21F26] text-white rounded-full text-[8px] px-1.5 py-0.5 font-black">
                                        {unreadCounts[u.id]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* 3. STATUS & TTL INFO TAB */}
                    {activeTab === 'STATUS' && (
                      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-slate-300 text-xs">
                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                          <div className="flex items-center gap-2 text-amber-400 font-extrabold">
                            <Info className="w-5 h-5 shrink-0" />
                            <span>Sistem Reset Chat 24 Jam</span>
                          </div>
                          <p className="leading-relaxed text-[11px] font-semibold text-slate-400">
                            Untuk menjaga performa database Indo Teknik ERP tetap optimal dan rapi, seluruh chat koordinasi workshop dirancang dengan sistem **Time-to-Live (TTL)**. 
                          </p>
                          <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-400 font-semibold pl-1">
                            <li>Chat otomatis dibersihkan setiap 24 jam.</li>
                            <li>Hanya menampilkan pesan per tanggal hari ini.</li>
                            <li>Mengurangi data sampah koordinasi pengerjaan lampau.</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800 space-y-4">
                          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Statistik Data Chat</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                              <span className="block text-[9px] font-black text-slate-500 uppercase">Total Pesan Aktif</span>
                              <span className="text-xl font-black text-white">{messages.length}</span>
                            </div>
                            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                              <span className="block text-[9px] font-black text-slate-500 uppercase">Siklus Pembersihan</span>
                              <span className="text-xs font-black text-[#E21F26]">Setiap Hari (TTL)</span>
                            </div>
                          </div>

                          {currentUser.role === 'ADMIN' && (
                            <button
                              onClick={handleManualPrune}
                              disabled={isCleaning}
                              className="w-full bg-[#E21F26] hover:bg-red-600 disabled:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                              <Trash2 className="w-4 h-4" />
                              {isCleaning ? 'Membersihkan...' : 'Hapus Chat Manual (> 24 Jam)'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  /* ======================================================== */
                  /* B. ACTIVE CONVERSATION SCREEN                            */
                  /* ======================================================== */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* Message Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20 custom-scrollbar">
                      {activeRoomMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-full shadow-lg">
                            <Sparkles className="w-6 h-6 text-slate-500 animate-pulse" />
                          </div>
                          <h4 className="text-slate-300 font-extrabold text-xs">Belum Ada Pesan Hari Ini</h4>
                          <p className="text-[10px] text-slate-500 max-w-[280px] leading-relaxed font-semibold">
                            Kirim koordinasi atau tanyakan status perbaikan unit di bawah.
                          </p>
                        </div>
                      ) : (
                        activeRoomMessages.map((msg) => {
                          const isOwn = msg.senderId === currentUser.id;
                          const formattedTime = new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                          const senderMeta = roleMeta[msg.senderRole] || { label: msg.senderRole, bg: 'bg-slate-800 text-slate-200', text: 'text-slate-300', iconBg: 'bg-slate-600', short: 'US' };

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} space-y-0.5 group/msg`}
                            >
                              {/* Sender Name in group threads */}
                              {!isOwn && (activeRoomId === 'ALL' || activeRoomId.startsWith('ROLE_') || activeRoomId.startsWith('WO_')) && (
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 mb-0.5">
                                  <span>{msg.senderName}</span>
                                  <span className={`px-1 rounded-[4px] text-[7px] font-black uppercase tracking-wider ${senderMeta.bg}`}>
                                    {senderMeta.short}
                                  </span>
                                </div>
                              )}

                              {/* Chat Bubble Layout */}
                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2 border text-xs leading-relaxed shadow-md relative group transition-all ${
                                  isOwn
                                    ? 'bg-[#0F2D59]/90 text-white border-blue-500/20 rounded-tr-none'
                                    : 'bg-slate-900 text-slate-100 border-slate-800/80 rounded-tl-none'
                                }`}
                              >
                                {/* Linked Unit/Plate Badge */}
                                {msg.relatedPlateNumber && (
                                  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase mb-1 ${isOwn ? 'bg-slate-950/40 text-blue-300 border border-blue-500/10' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                                    <Wrench className="w-2.5 h-2.5 text-blue-400" />
                                    <span>{msg.relatedPlateNumber}</span>
                                  </div>
                                )}

                                <div className="break-words whitespace-pre-wrap font-semibold leading-relaxed">{msg.text}</div>
                                
                                {/* Time & check status */}
                                <div className={`flex items-center justify-end gap-1 text-[8px] mt-1 font-bold ${isOwn ? 'text-blue-300/80' : 'text-slate-500'}`}>
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{formattedTime}</span>
                                  {isOwn && (() => {
                                    const isDirectMessage = msg.recipientId && 
                                      msg.recipientId !== 'ALL' && 
                                      !msg.recipientId.startsWith('ROLE_') && 
                                      !msg.recipientId.startsWith('WO_');
                                    
                                    if (isDirectMessage) {
                                      const isReadByRecipient = msg.readBy && msg.recipientId && msg.readBy.includes(msg.recipientId);
                                      return isReadByRecipient ? (
                                        <CheckCheck className="w-3.5 h-3.5 text-red-500 ml-0.5 shrink-0" title="Dibaca oleh penerima" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" title="Terkirim" />
                                      );
                                    } else {
                                      const groupReadCount = msg.readBy ? msg.readBy.filter(uid => uid !== msg.senderId).length : 0;
                                      return groupReadCount > 0 ? (
                                        <div className="flex items-center gap-0.5 ml-0.5 shrink-0 text-red-500 font-black text-[8px]" title={`Dibaca oleh ${groupReadCount} orang`}>
                                          <CheckCheck className="w-3.5 h-3.5" />
                                          <span className="text-[7px]">{groupReadCount}</span>
                                        </div>
                                      ) : (
                                        <Check className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" title="Terkirim ke grup" />
                                      );
                                    }
                                  })()}
                                </div>
                              </div>

                              {/* Elegant reveal of full details on hover */}
                              <div className={`text-[9px] text-slate-500/80 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 px-1 font-semibold select-none ${isOwn ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.timestamp).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })} pukul {formattedTime}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Sub-chat bottom footer controls */}
                    <div className="bg-slate-900 border-t border-slate-800 p-3 shrink-0 space-y-3 pb-safe">
                      
                      {/* Active plate binding logic */}
                      <div className="flex items-center gap-1.5 justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                          <Wrench className="w-3.5 h-3.5 text-[#E21F26]" />
                          <span>Tautkan Kendaraan:</span>
                        </div>
                        <select
                          value={selectedWOId}
                          onChange={(e) => setSelectedWOId(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg text-[10px] px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500 transition-all font-semibold max-w-[200px]"
                        >
                          <option value="">-- Tanpa Tautan Unit --</option>
                          {workOrders
                            .filter((wo) => !wo.isArchived)
                            .map((wo) => (
                              <option key={wo.id} value={wo.id}>
                                {wo.plateNumber} ({wo.customerName})
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Message Write Input */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder={`Tulis pesan ke ${activeRoomTitle}...`}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSendMessage}
                          className="bg-[#E21F26] hover:bg-red-600 text-white p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
