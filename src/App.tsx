/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  User,
  ShoppingBag,
  Send,
  MessageSquare,
  Search,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  TrendingUp,
  Globe,
  Settings,
  ArrowRight,
  Sparkles,
  DollarSign,
  Copy,
  Users,
  RefreshCw,
  Facebook,
  Youtube,
  Menu,
  Check,
  ChevronRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CheckSiteResult, PageAnalysis, Order, Deposit, Product, ChatMessage } from "./types";

export default function App() {
  // Global states synced with Express backend
  const [wallet, setWallet] = useState({ balance: 150, userName: "Taisir Foyej", userProfilePic: "" });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loadingState, setLoadingState] = useState(false);

  // Active Screen in Phone Emulator: 'home' | 'topup_form' | 'add_money' | 'orders' | 'profile' | 'video_tutorial' | 'security'
  const [activeScreen, setActiveScreen] = useState<"home" | "topup_form" | "add_money" | "orders" | "profile" | "security">("home");
  
  // Selected category in top up form
  const [selectedCategory, setSelectedCategory] = useState<"ff_uid" | "weekly_monthly" | "offers" | "others">("ff_uid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Forms
  const [playerUid, setPlayerUid] = useState("");
  const [playerName, setPlayerName] = useState("Taisir Pro");
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<"wallet" | "bkash" | "nagad" | "rocket">("wallet");
  const [manualTxId, setManualTxId] = useState("");
  const [manualSender, setManualSender] = useState("");
  const [orderQuantity, setOrderQuantity] = useState(1);

  // Add Money Form
  const [depositMethod, setDepositMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositSender, setDepositSender] = useState("");
  const [depositTxId, setDepositTxId] = useState("");
  const [depositSuccessMsg, setDepositSuccessMsg] = useState("");

  // Scanner states (Admin Panel)
  const [scanUrl, setScanUrl] = useState("topup-secure.com");
  const [scanResult, setScanResult] = useState<CheckSiteResult | null>(null);
  const [scanning, setScanning] = useState(false);

  // AI Chat Assistant States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "আসসালামু আলাইকুম! আমি **টপআপ শিল্ড এআই** (TopUp Shield AI)। গেম টপ-আপ করার সময় আইডি হ্যাকিং এবং প্রতারণা থেকে কীভাবে নিজেকে সুরক্ষিত রাখবেন তা জানতে আমাকে যেকোনো প্রশ্ন করতে পারেন। আপনি কি নিরাপদ টপ-আপ সম্পর্কে জানতে চান?",
      timestamp: new Date()
    }
  ]);
  const [sendingChat, setSendingChat] = useState(false);

  // Video Tutorial Modal
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Admin Controls state
  const [adminActiveTab, setAdminActiveTab] = useState<"orders" | "deposits" | "products" | "scanner">("orders");
  const [mobileSecurityTab, setMobileSecurityTab] = useState<"scan" | "chat">("scan");
  const [copiedText, setCopiedText] = useState("");

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [now, setNow] = useState(Date.now());

  // Fetch initial app state
  const fetchAppState = async () => {
    try {
      const response = await fetch("/api/app-state");
      const data = await response.json();
      if (data) {
        setWallet(data.wallet);
        setProducts(data.products);
        setOrders(data.orders);
        setDeposits(data.deposits);
        
        // Default selected product
        const ffProducts = data.products.filter((p: Product) => p.category === "ff_uid");
        if (ffProducts.length > 0 && !selectedProduct) {
          setSelectedProduct(ffProducts[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching app state:", err);
    }
  };

  useEffect(() => {
    fetchAppState();
    // Pre-run scan for topup-secure.com
    handleRunScan("topup-secure.com");
  }, []);

  // Update "now" every 1s for progress tracking if there are active orders
  useEffect(() => {
    const hasActiveOrders = orders.some(o => o.status === "pending" || o.status === "processing");
    if (!hasActiveOrders) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [orders]);

  // Poll server state every 3s to sync final order state if there are active orders
  useEffect(() => {
    const hasActiveOrders = orders.some(o => o.status === "pending" || o.status === "processing");
    if (!hasActiveOrders) return;

    const pollTimer = setInterval(() => {
      fetchAppState();
    }, 3000);
    return () => clearInterval(pollTimer);
  }, [orders]);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Run security scan
  const handleRunScan = async (url: string) => {
    if (!url) return;
    setScanning(true);
    try {
      const response = await fetch("/api/check-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      setScanResult(data);
      if (data.isOnline) {
        triggerToast(`স্ক্যান সম্পন্ন হয়েছে: ${url} সক্রিয় আছে!`, "success");
      } else {
        triggerToast(`স্ক্যান সতর্কতা: ${url} অফলাইন বা সমস্যা দেখাচ্ছে!`, "error");
      }
    } catch (err) {
      console.error("Error scanning site:", err);
      triggerToast("ওয়েবসাইটটি স্ক্যান করতে ব্যর্থ হয়েছে।", "error");
    } finally {
      setScanning(false);
    }
  };

  // Submit TopUp Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      triggerToast("দয়া করে একটি প্রোডাক্ট সিলেক্ট করুন!", "error");
      return;
    }
    if (selectedCategory === "ff_uid" && !playerUid) {
      triggerToast("প্লেয়ার UID দেওয়া আবশ্যক!", "error");
      return;
    }
    if (orderPaymentMethod !== "wallet" && (!manualSender || !manualTxId)) {
      triggerToast("টাকা পাঠানোর স্যান্ডার নম্বর এবং TrxID দিন!", "error");
      return;
    }

    setLoadingState(true);
    try {
      const response = await fetch("/api/topup-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: playerName || "Gamer Pro",
          playerUid: playerUid,
          productId: selectedProduct.id,
          quantity: orderQuantity,
          paymentMethod: orderPaymentMethod,
          transactionId: manualTxId,
          senderNumber: manualSender
        })
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
        setWallet(data.wallet);
        triggerToast(data.message, "success");
        // Reset order form
        setPlayerUid("");
        setManualTxId("");
        setManualSender("");
        setActiveScreen("orders");
      } else {
        triggerToast(data.error || "অর্ডার সম্পন্ন করা যায়নি", "error");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      triggerToast("নেটওয়ার্ক সমস্যার কারণে অর্ডার সাবমিট করা যায়নি।", "error");
    } finally {
      setLoadingState(false);
    }
  };

  // Submit Deposit (Add Money)
  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !depositSender || !depositTxId) {
      triggerToast("সকল তথ্য সঠিকভাবে পূরণ করুন!", "error");
      return;
    }

    setLoadingState(true);
    try {
      const response = await fetch("/api/add-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: depositMethod,
          amount: depositAmount,
          senderNumber: depositSender,
          transactionId: depositTxId
        })
      });

      const data = await response.json();
      if (response.ok) {
        setDeposits(data.deposits);
        setDepositSuccessMsg(`অভিনন্দন! আপনার ${depositAmount} TK ডিপোজিট রিকোয়েস্ট জমা হয়েছে। বামপাশের এডমিন প্যানেল থেকে এটি এপ্রুভ করুন।`);
        triggerToast("পেমেন্ট ভেরিফিকেশন রিকোয়েস্ট জমা হয়েছে", "success");
        // Reset
        setDepositAmount("");
        setDepositSender("");
        setDepositTxId("");
      } else {
        triggerToast(data.error || "অনুরোধ পাঠানো সম্ভব হয়নি", "error");
      }
    } catch (err) {
      console.error("Deposit submission error:", err);
      triggerToast("সার্ভার ত্রুটি, আবার চেষ্টা করুন।", "error");
    } finally {
      setLoadingState(false);
    }
  };

  // Admin Actions: Approve Deposit
  const handleApproveDeposit = async (id: string) => {
    try {
      const response = await fetch("/api/admin/approve-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId: id })
      });
      const data = await response.json();
      if (response.ok) {
        setDeposits(data.deposits);
        setWallet(data.wallet);
        triggerToast(data.message, "success");
      } else {
        triggerToast(data.error, "error");
      }
    } catch (err) {
      console.error("Error approving deposit:", err);
    }
  };

  // Admin Actions: Reject Deposit
  const handleRejectDeposit = async (id: string) => {
    try {
      const response = await fetch("/api/admin/reject-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId: id })
      });
      const data = await response.json();
      if (response.ok) {
        setDeposits(data.deposits);
        triggerToast(data.message, "info");
      } else {
        triggerToast(data.error, "error");
      }
    } catch (err) {
      console.error("Error rejecting deposit:", err);
    }
  };

  // Admin Actions: Update Order Status
  const handleUpdateOrderStatus = async (id: string, status: "pending" | "processing" | "complete" | "failed") => {
    try {
      const response = await fetch("/api/admin/update-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, status })
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
        setWallet(data.wallet);
        triggerToast(data.message, "success");
      } else {
        triggerToast(data.error, "error");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  // Admin Actions: Update product price
  const handleUpdateProductPrice = async (id: string, newPrice: number) => {
    try {
      const response = await fetch("/api/admin/update-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, price: newPrice })
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
        triggerToast(data.message, "success");
      } else {
        triggerToast(data.error, "error");
      }
    } catch (err) {
      console.error("Error updating product price:", err);
    }
  };

  // Reset backend database state to default
  const handleResetDb = async () => {
    try {
      const response = await fetch("/api/admin/reset", { method: "POST" });
      const data = await response.json();
      setWallet(data.wallet);
      setOrders(data.orders);
      setDeposits(data.deposits);
      triggerToast(data.message, "info");
    } catch (err) {
      console.error("Error resetting db:", err);
    }
  };

  // Send Chat message
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      text: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const messageToSend = chatInput;
    setChatInput("");
    setSendingChat(true);

    try {
      // Map history
      const history = chatMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, history })
      });
      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "model",
        text: data.response || "দুঃখিত, সংযোগে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Error in chat:", err);
      setChatMessages(prev => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "model",
          text: "আমার সার্ভার সংযোগে সামান্য সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণের মধ্যে পুনরায় বার্তা পাঠান।",
          timestamp: new Date()
        }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    triggerToast("নম্বর কপি করা হয়েছে!", "success");
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-[#7c3aed] selection:text-white">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />

      {/* Header Bar */}
      <header className="hidden lg:block border-b border-slate-800 bg-[#0f111a]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900/60 rounded-xl overflow-hidden shadow-lg ring-1 ring-slate-850 flex items-center justify-center">
              <img 
                src="https://chatgpt.com/s/m_6a4a7b1a108c819197b52d3321cce55e" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                BD TOP UP Trust Center & App Simulator
              </h1>
              <p className="text-xs text-slate-400">
                ইন্টারেক্টিভ মোবাইল ডায়মন্ড টপ-আপ সিস্টেম ও ট্রাস্ট অ্যানালাইজার
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Database reset button */}
            <button
              onClick={handleResetDb}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-300 ring-1 ring-slate-700 hover:ring-slate-600 transition flex items-center gap-1.5"
              title="স্টেট প্রথম অবস্থায় নিয়ে যান"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              সিস্টেম রিসেট
            </button>

            {/* Quick stats indicators */}
            <div className="hidden lg:flex items-center gap-6 text-sm py-1 px-4 bg-slate-900/60 ring-1 ring-slate-800 rounded-full">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-400 text-xs">অর্ডার ড্যাশবোর্ড:</span>
                <span className="font-mono text-emerald-400 font-semibold">{orders.length}</span>
              </div>
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">ডিপোজিট রিকোয়েস্ট:</span>
                <span className="font-mono text-violet-400 font-semibold">
                  {deposits.filter(d => d.status === "pending").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-0 lg:px-6 py-0 lg:py-10 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:gap-8 items-stretch lg:items-start w-full min-h-[100dvh] lg:min-h-0">
          
          {/* LEFT AREA: Security Scanner & Admin Controls (7 Columns) */}
          <section className="hidden lg:block lg:col-span-7 space-y-6">
            
            {/* Website Safety scanner widget */}
            <div className="bg-[#0f111a] border border-slate-800/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-600" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-slate-200">ওয়েবসাইট ট্রাস্ট অডিটর</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider bg-indigo-950/50 ring-1 ring-indigo-500/20 px-2.5 py-1 rounded">
                  Gemini Grounded Scan
                </span>
              </div>
              
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                বাংলাদেশী গেমারদের আর্থিক ও অ্যাকাউন্ট নিরাপত্তা নিশ্চিতে যেকোনো টপ-আপ ডোমেইন (যেমন <strong>topup-secure.com</strong>) ইনপুট দিন। আমাদের এআই স্ক্র্যাপার সাইটটির নিরাপত্তা, রিফান্ড পলিসি, পেমেন্ট গেটওয়ে এবং এসএসএল ভেরিফাই করে বিস্তারিত অডিট তৈরি করবে।
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={scanUrl}
                    onChange={(e) => setScanUrl(e.target.value)}
                    placeholder="e.g. topup-secure.com"
                    className="w-full bg-[#161925] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono text-slate-200 focus:outline-none transition"
                  />
                </div>
                <button
                  onClick={() => handleRunScan(scanUrl)}
                  disabled={scanning}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:from-indigo-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-indigo-950/30"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      স্ক্যানিং...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      অডিট করুন
                    </>
                  )}
                </button>
              </div>

              {/* Scan outcome display */}
              {scanResult && (
                <div className="mt-5 border-t border-slate-800/80 pt-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131522] rounded-xl p-3.5 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400 ring-1 ring-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-mono font-bold text-slate-100">{scanResult.url}</h4>
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Latency: {scanResult.latencyMs}ms
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-medium">নিরাপত্তা স্কোর (Trust Score)</div>
                        <div className="text-xl font-bold font-mono text-indigo-400">
                          {scanResult.analysis?.trustScore || 0}/100
                        </div>
                      </div>
                      
                      {/* Circular Trust Ring */}
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke={((scanResult.analysis?.trustScore || 0) > 70) ? "#10b981" : "#6366f1"}
                            strokeWidth="2.5"
                            strokeDasharray={`${scanResult.analysis?.trustScore || 0}, 100`}
                          />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-slate-200">
                          {scanResult.analysis?.trustScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Auto technical badges */}
                  {scanResult.analysis && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className={`p-2 rounded-lg border ${scanResult.analysis.isHttps ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' : 'bg-rose-950/20 border-rose-900/50 text-rose-400'}`}>
                        SSL (HTTPS): {scanResult.analysis.isHttps ? 'Active' : 'Missing'}
                      </div>
                      <div className={`p-2 rounded-lg border ${scanResult.analysis.payments.bkash || scanResult.analysis.payments.shurjopay ? 'bg-indigo-950/20 border-indigo-900/50 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                        bKash/Nagad: {scanResult.analysis.payments.bkash ? 'Detected' : 'Not Found'}
                      </div>
                      <div className={`p-2 rounded-lg border ${scanResult.analysis.policies.terms || scanResult.analysis.policies.refund ? 'bg-indigo-950/20 border-indigo-900/50 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                        Policies: {scanResult.analysis.policies.terms ? 'Listed' : 'Unavailable'}
                      </div>
                      <div className="p-2 rounded-lg border bg-slate-900 border-slate-800 text-slate-300 font-mono">
                        Contact: {scanResult.analysis.phones.length > 0 ? 'Provided' : 'None'}
                      </div>
                    </div>
                  )}

                  {/* AI Bengali report with ReactMarkdown */}
                  <div className="bg-[#121420] border border-slate-800/80 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                      <h4 className="text-xs font-bold text-fuchsia-300 tracking-wide uppercase">Gemini এআই সিকিউরিটি রিপোর্ট (বাংলায়)</h4>
                    </div>
                    <div className="prose prose-invert prose-sm max-h-[300px] overflow-y-auto pr-1 text-slate-300 leading-relaxed text-xs markdown-body">
                      <ReactMarkdown>{scanResult.aiReport || ""}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Educational Trust & Account Safety guidelines card */}
            <div className="bg-gradient-to-br from-[#12111d] to-[#0d121c] border border-indigo-950 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-violet-600/5 blur-[50px] pointer-events-none" />
              
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2 mb-3">
                <Shield className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                গেমারদের জন্য অ্যাকাউন্ট ও ট্রানজেকশন নিরাপত্তা গাইড
              </h4>
              
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>UID (Player ID) টপ-আপ ব্যবহার করুন:</strong> এটি শতভাগ নিরাপদ। গেমের ডায়মন্ডের জন্য কখনোই আপনার ফেসবুক বা জিমেইল পাসওয়ার্ড এবং OTP শেয়ার করবেন না।
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>অস্বাভাবিক কম দাম থেকে সাবধান:</strong> কোনো সাইটে অবিশ্বাস্য বা অস্বাভাবিক কম দামে ডায়মন্ড অফার করলে সেটি স্ক্যাম বা হ্যাকিং সাইট হওয়ার সম্ভাবনা বেশি।
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>পেমেন্ট গেটওয়ে চেক করুন:</strong> বিশ্বস্ত ওয়েবসাইটের সাধারণত মার্চেন্ট পেমেন্ট গেটওয়ে থাকে (যেমন সূর্যপে, এসএসএল কমার্স)। ব্যক্তিগত নম্বরে টাকা পাঠানোর সময় এডমিনের আইডেন্টিটি কনফার্ম করুন।
                  </span>
                </li>
              </ul>
            </div>

          </section>

          {/* RIGHT AREA: Realistic Mobile App Emulator (5 Columns) */}
          <section className="w-full lg:col-span-5 flex flex-col items-center min-h-[100dvh] lg:min-h-0">
            
            {/* Phone Bezel */}
            <div className="w-full min-h-[100dvh] h-[100dvh] lg:w-[380px] lg:h-[780px] bg-[#0c0d14] rounded-none lg:rounded-[48px] border-0 lg:border-[10px] border-slate-900 shadow-none lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative flex flex-col overflow-hidden ring-0 lg:ring-4 ring-slate-800/40">
              
              {/* Phone Speaker & Camera Notch */}
              <div className="hidden lg:flex absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-full z-50 items-center justify-between px-4">
                <div className="w-10 h-1 bg-slate-800 rounded-full" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-900" />
                </div>
              </div>

              {/* Status Bar */}
              <div className="hidden lg:flex bg-[#0f111a] px-6 pt-7 pb-1 text-[11px] font-mono text-slate-400 justify-between items-center z-40 select-none">
                <span>8:50</span>
                <div className="flex items-center gap-1.5">
                  <span>4G</span>
                  <Smartphone className="w-3.5 h-3.5" />
                  <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center">
                    <div className="h-full w-4/5 bg-slate-400 rounded-2xs" />
                  </div>
                  <span>85%</span>
                </div>
              </div>

              {/* Simulated Mobile Application Viewport */}
              <div className="flex-1 overflow-y-auto bg-[#121420] flex flex-col relative">
                
                {/* 1. Brand Header */}
                <div className="bg-[#0f111a] border-b border-slate-800/60 p-4 sticky top-0 z-30 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {/* Brand icon */}
                    <div className="w-9 h-9 bg-slate-900 rounded-lg overflow-hidden shadow ring-1 ring-slate-800 flex items-center justify-center">
                      <img 
                        src="https://chatgpt.com/s/m_6a4a7b1a108c819197b52d3321cce55e" 
                        alt="Logo" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="leading-tight">
                      <span className="text-xs text-slate-400 block font-bold tracking-widest uppercase">Platform</span>
                      <span className="text-sm font-black text-white tracking-wider">SECURE TOP UP</span>
                    </div>
                  </div>

                  {/* Wallet TK balance button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveScreen("add_money")}
                      className="px-2.5 py-1.5 bg-violet-600/20 text-violet-300 hover:bg-violet-600 hover:text-white transition rounded-full text-xs font-bold border border-violet-500/20 flex items-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{wallet.balance} TK</span>
                    </button>
                    
                    {/* User profile avatar link */}
                    <button
                      onClick={() => setActiveScreen("profile")}
                      className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 overflow-hidden flex items-center justify-center"
                    >
                      {wallet.userProfilePic ? (
                        <img src={wallet.userProfilePic} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Page Content Rendering */}
                <div className="flex-1 pb-16">
                  
                  {/* APP HOME SCREEN */}
                  {activeScreen === "home" && (
                    <div className="space-y-4">
                      
                      {/* Promo Banner with Play Video */}
                      <div className="mx-4 mt-3 rounded-2xl overflow-hidden relative group cursor-pointer shadow-lg shadow-slate-950">
                        {/* Purple gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/90 via-indigo-950/85 to-[#121420]/30 z-10" />
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase z-20">
                          Official Guide
                        </div>
                        
                        <div className="p-4 relative z-20 flex flex-col justify-between h-[155px]">
                          <div>
                            <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">বাংলাদেশী গেমারদের ভরসা</p>
                            <h4 className="text-base font-bold text-white mt-1 leading-snug">
                              কীভাবে সুরক্ষিতভাবে<br />সহজে ডায়মন্ড টপআপ করবেন?
                            </h4>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {/* Payment method small icons */}
                              <span className="text-[8px] bg-purple-950/60 ring-1 ring-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold uppercase">Rocket</span>
                              <span className="text-[8px] bg-pink-950/60 ring-1 ring-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-bold uppercase">bKash</span>
                              <span className="text-[8px] bg-amber-950/60 ring-1 ring-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase">Nagad</span>
                            </div>

                            <button
                              onClick={() => setShowVideoModal(true)}
                              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-950 font-black text-[10px] rounded-full flex items-center gap-1 transition"
                            >
                              <Youtube className="w-3 h-3 text-rose-600 fill-rose-600" />
                              WATCH VIDEO
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Header title for "Offer Offer Offer" (Screenshot 1) */}
                      <div className="px-4">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-violet-400" />
                          Offer Offer Offer
                        </h3>
                        <p className="text-[10px] text-slate-400">সীমিত সময়ের আকর্ষণীয় স্পেশাল গেম বান্ডেলসমূহ</p>
                      </div>

                      {/* Horizontal scrollable row for Special Offers */}
                      <div className="flex overflow-x-auto gap-3.5 px-4 pb-1 no-scrollbar">
                        {products.filter(p => p.category === "offers").map((offer) => (
                          <div
                            key={offer.id}
                            onClick={() => {
                              setSelectedCategory("offers");
                              setSelectedProduct(offer);
                              setActiveScreen("topup_form");
                            }}
                            className="flex-shrink-0 w-[145px] bg-[#161825] hover:bg-[#1c1f2f] ring-1 ring-slate-800 hover:ring-violet-500/30 rounded-xl p-3 cursor-pointer transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="text-[9px] text-fuchsia-400 font-bold bg-fuchsia-950/40 ring-1 ring-fuchsia-500/10 px-1.5 py-0.5 rounded-md inline-block mb-2 overflow-hidden truncate max-w-full">
                                {offer.tag || "বিশেষ অফার"}
                              </div>
                              <h4 className="text-xs font-black text-slate-200 leading-tight">{offer.name}</h4>
                            </div>

                            <div className="mt-3 flex items-baseline justify-between">
                              <span className="text-xs font-black text-emerald-400">{offer.price} TK</span>
                              {offer.originalPrice && (
                                <span className="text-[9px] line-through text-slate-500">{offer.originalPrice} TK</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Free Fire Grid Title */}
                      <div className="px-4 pt-1">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-violet-400" />
                          Free Fire Top Up Categories
                        </h3>
                        <p className="text-[10px] text-slate-400">নিরাপদ প্লেয়ার আইডি (UID) ডেলিভারি সিস্টেম</p>
                      </div>

                      {/* Grid categories for Game options */}
                      <div className="grid grid-cols-2 gap-3 px-4">
                        
                        {/* Free Fire (UID) button */}
                        <div
                          onClick={() => {
                            setSelectedCategory("ff_uid");
                            // select first product of ff_uid
                            const ff = products.find(p => p.category === "ff_uid");
                            if (ff) setSelectedProduct(ff);
                            setActiveScreen("topup_form");
                          }}
                          className="bg-[#141624] hover:bg-[#1a1d2f] border border-slate-800/80 hover:border-violet-600/40 rounded-xl p-3.5 cursor-pointer transition flex flex-col items-center text-center group"
                        >
                          <div className="w-12 h-12 bg-orange-600/10 rounded-full flex items-center justify-center mb-2.5 ring-4 ring-orange-500/5 group-hover:scale-105 transition-transform">
                            <span className="text-lg">🔥</span>
                          </div>
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white">FREE FIRE (UID)</span>
                          <span className="text-[9px] text-emerald-400 mt-0.5">সবচেয়ে জনপ্রিয়</span>
                        </div>

                        {/* Weekly/Monthly button */}
                        <div
                          onClick={() => {
                            setSelectedCategory("weekly_monthly");
                            const wm = products.find(p => p.category === "weekly_monthly");
                            if (wm) setSelectedProduct(wm);
                            setActiveScreen("topup_form");
                          }}
                          className="bg-[#141624] hover:bg-[#1a1d2f] border border-slate-800/80 hover:border-violet-600/40 rounded-xl p-3.5 cursor-pointer transition flex flex-col items-center text-center group"
                        >
                          <div className="w-12 h-12 bg-violet-600/10 rounded-full flex items-center justify-center mb-2.5 ring-4 ring-violet-500/5 group-hover:scale-105 transition-transform">
                            <span className="text-lg">💎</span>
                          </div>
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white">Weekly/Monthly</span>
                          <span className="text-[9px] text-slate-400 mt-0.5">অটো রিওয়ার্ড প্যাক</span>
                        </div>

                        {/* Unipin Voucher button */}
                        <div
                          onClick={() => {
                            setSelectedCategory("others");
                            const uni = products.find(p => p.id === "other_unipin");
                            if (uni) setSelectedProduct(uni);
                            setActiveScreen("topup_form");
                          }}
                          className="bg-[#141624] hover:bg-[#1a1d2f] border border-slate-800/80 hover:border-violet-600/40 rounded-xl p-3.5 cursor-pointer transition flex flex-col items-center text-center group"
                        >
                          <div className="w-12 h-12 bg-sky-600/10 rounded-full flex items-center justify-center mb-2.5 ring-4 ring-sky-500/5 group-hover:scale-105 transition-transform">
                            <span className="text-lg">🎫</span>
                          </div>
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white">Unipin Voucher</span>
                          <span className="text-[9px] text-slate-400 mt-0.5">তাত্ক্ষণিক কোড</span>
                        </div>

                        {/* ID Code Indonesia button */}
                        <div
                          onClick={() => {
                            setSelectedCategory("others");
                            const ind = products.find(p => p.id === "other_indonesia");
                            if (ind) setSelectedProduct(ind);
                            setActiveScreen("topup_form");
                          }}
                          className="bg-[#141624] hover:bg-[#1a1d2f] border border-slate-800/80 hover:border-violet-600/40 rounded-xl p-3.5 cursor-pointer transition flex flex-col items-center text-center group"
                        >
                          <div className="w-12 h-12 bg-emerald-600/10 rounded-full flex items-center justify-center mb-2.5 ring-4 ring-emerald-500/5 group-hover:scale-105 transition-transform">
                            <span className="text-lg">🌏</span>
                          </div>
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white">ID Code Indonesia</span>
                          <span className="text-[9px] text-slate-400 mt-0.5">ইন্দোনেশিয়া সার্ভার</span>
                        </div>

                      </div>

                      {/* Latest Live Orders (Screenshot 2) */}
                      <div className="px-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Completed Orders</h4>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        
                        <div className="space-y-2">
                          {orders.slice(0, 3).map((o) => (
                            <div key={o.id} className="bg-[#141624] border border-slate-850 rounded-xl p-3 flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-200">
                                  {o.playerName.charAt(0)}
                                </div>
                                <div className="leading-tight">
                                  <h5 className="font-bold text-slate-200">{o.playerName}</h5>
                                  <span className="text-[10px] text-slate-400">{o.productName} - {o.price} TK</span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-950/60 text-emerald-400 ring-1 ring-emerald-500/20">
                                complete
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Follow Us social links (Screenshot 3) */}
                      <div className="px-4 space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Follow Us / Helpdesk</h4>
                        
                        <a
                          href="https://wa.me/880170000000"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3.5 bg-emerald-950/10 hover:bg-emerald-950/20 ring-1 ring-emerald-500/20 rounded-xl transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-600/10 text-emerald-400 rounded-lg">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div className="leading-tight">
                              <h5 className="text-xs font-bold text-slate-200">WhatsApp Helpline</h5>
                              <p className="text-[10px] text-slate-400">যে কোনো সমস্যায় সরাসরি চ্যাট করুন</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </a>

                        <div className="flex items-center justify-between p-3.5 bg-[#141624] ring-1 ring-slate-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg">
                              <ExternalLink className="w-5 h-5" />
                            </div>
                            <div className="leading-tight">
                              <h5 className="text-xs font-bold text-slate-200">Join Telegram Channel</h5>
                              <p className="text-[10px] text-slate-400">গিভঅ্যাওয়ে এবং অফারের আপডেট পেতে</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      {/* Simulated Mini App Footer */}
                      <div className="bg-[#0f111a] border-t border-slate-800/40 p-5 text-center text-[10px] text-slate-500">
                        <span className="font-bold text-slate-400 block mb-1">STAY CONNECTED</span>
                        <p className="leading-relaxed px-4 mb-3">যে কোনো সমস্যায় হোয়াটসঅ্যাপে যোগাযোগ করুন। দ্রুত সমাধান পেয়ে যাবেন।</p>
                        <div className="flex justify-center gap-4 text-slate-400">
                          <Facebook className="w-4 h-4 hover:text-blue-500 transition cursor-pointer" />
                          <Youtube className="w-4 h-4 hover:text-red-500 transition cursor-pointer" />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SCREEN 2: TopUp Form View */}
                  {activeScreen === "topup_form" && (
                    <div className="p-4 space-y-4">
                      
                      {/* Back button */}
                      <button
                        onClick={() => setActiveScreen("home")}
                        className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-bold mb-2"
                      >
                        ←হোম পেজে ফিরে যান
                      </button>

                      <div className="bg-[#141624] border border-slate-800 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                          <div className="w-10 h-10 bg-orange-600/15 text-orange-500 rounded-full flex items-center justify-center font-bold">
                            FF
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-200 capitalize">
                              {selectedCategory === 'ff_uid' ? 'Free Fire (UID) TopUp' : selectedCategory.replace('_', ' ')}
                            </h3>
                            <p className="text-[10px] text-slate-400">অর্ডার করার ৫-১০ মিনিটের মধ্যে ডেলিভারি</p>
                          </div>
                        </div>

                        <form onSubmit={handlePlaceOrder} className="space-y-4">
                          
                          {/* Player identity details (Only for UID) */}
                          {selectedCategory === "ff_uid" && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Player UID (প্লেয়ার আইডি)</label>
                                <input
                                  type="text"
                                  value={playerUid}
                                  onChange={(e) => setPlayerUid(e.target.value)}
                                  placeholder="e.g. 2930283401"
                                  className="w-full bg-[#0c0d14] border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none transition"
                                  required
                                />
                                <span className="text-[9px] text-indigo-400">আপনার সঠিক গেমিং ইউআইডি (UID) লিখুন। ভুল আইডির জন্য ডায়মন্ড অন্য আইডিতে চলে যেতে পারে।</span>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nick Name (প্লেয়ার নিকনেম - ঐচ্ছিক)</label>
                                <input
                                  type="text"
                                  value={playerName}
                                  onChange={(e) => setPlayerName(e.target.value)}
                                  placeholder="e.g. Taisir Pro"
                                  className="w-full bg-[#0c0d14] border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none transition"
                                />
                              </div>
                            </div>
                          )}

                          {/* Package selection list */}
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Select Bundle (প্যাকেজ নির্বাচন করুন)</label>
                            
                            <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                              {products.filter(p => p.category === selectedCategory).map((prod) => (
                                <div
                                  key={prod.id}
                                  onClick={() => setSelectedProduct(prod)}
                                  className={`p-2.5 rounded-xl border cursor-pointer transition flex justify-between items-center ${selectedProduct?.id === prod.id ? 'bg-violet-950/20 border-violet-500 text-white' : 'bg-[#0c0d14] border-slate-800/80 hover:border-slate-700 text-slate-300'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${selectedProduct?.id === prod.id ? 'bg-violet-500 animate-pulse' : 'bg-transparent'}`} />
                                    <span className="text-xs font-bold">{prod.name}</span>
                                    {prod.tag && (
                                      <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1 py-0.2 rounded uppercase font-black tracking-wider">
                                        {prod.tag}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs font-mono font-bold text-emerald-400">{prod.price} TK</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantity (সংখ্যা)</label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                              >
                                -
                              </button>
                              <span className="w-10 text-center text-sm font-bold font-mono">{orderQuantity}</span>
                              <button
                                type="button"
                                onClick={() => setOrderQuantity(orderQuantity + 1)}
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Payment Choice */}
                          <div className="space-y-2 border-t border-slate-850 pt-3">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Payment Method (পেমেন্ট পদ্ধতি)</label>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {/* Wallet Balance option */}
                              <div
                                onClick={() => setOrderPaymentMethod("wallet")}
                                className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col justify-center items-center text-center ${orderPaymentMethod === 'wallet' ? 'bg-violet-950/20 border-violet-500 text-white' : 'bg-[#0c0d14] border-slate-800 text-slate-400'}`}
                              >
                                <span className="text-xs font-bold">Wallet Pay</span>
                                <span className="text-[9px] text-slate-400 mt-0.5">Bal: {wallet.balance} TK</span>
                              </div>

                              {/* Manual Bkash option */}
                              <div
                                onClick={() => setOrderPaymentMethod("bkash")}
                                className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col justify-center items-center text-center ${orderPaymentMethod === 'bkash' ? 'bg-pink-950/20 border-pink-500 text-white' : 'bg-[#0c0d14] border-slate-800 text-slate-400'}`}
                              >
                                <span className="text-xs font-bold text-pink-500">bKash Pay</span>
                                <span className="text-[8px] text-slate-400 mt-0.5">ম্যানুয়াল ট্রান্সফার</span>
                              </div>
                            </div>
                          </div>

                          {/* If Bkash transfer is chosen, show instructions */}
                          {orderPaymentMethod !== "wallet" && (
                            <div className="p-3 bg-[#0c0d14] border border-slate-800 rounded-xl space-y-2 text-[11px]">
                              <p className="text-slate-300 font-bold text-[10px]">ম্যানুয়াল টাকা পাঠানোর নিয়ম:</p>
                              <p className="text-slate-400 leading-relaxed">
                                আমাদের পার্সোনাল bKash নম্বরে <strong className="text-pink-400 font-mono">01711223344</strong> মোট <strong className="text-emerald-400 font-bold">{(selectedProduct?.price || 0) * orderQuantity} TK</strong> সেন্ডমানি করুন। এরপর নিচে আপনার প্রেরক নম্বর ও TrxID দিন।
                              </p>
                              
                              <div className="space-y-2 pt-1">
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Sender Mobile Number (প্রেরক নম্বর)</label>
                                  <input
                                    type="text"
                                    value={manualSender}
                                    onChange={(e) => setManualSender(e.target.value)}
                                    placeholder="e.g. 017xxxxxxxx"
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Transaction ID (TrxID)</label>
                                  <input
                                    type="text"
                                    value={manualTxId}
                                    onChange={(e) => setManualTxId(e.target.value)}
                                    placeholder="e.g. BKX9DJS2KD"
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Total Price & Submit button */}
                          <div className="border-t border-slate-850 pt-3 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Payable</span>
                              <span className="text-sm font-black text-emerald-400 font-mono">
                                {selectedProduct ? selectedProduct.price * orderQuantity : 0} TK
                              </span>
                            </div>

                            <button
                              type="submit"
                              disabled={loadingState}
                              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-950/20 active:scale-95 transition"
                            >
                              {loadingState ? "অর্ডার প্রসেসড..." : "ORDER NOW (অর্ডার করুন)"}
                            </button>
                          </div>

                        </form>
                      </div>

                    </div>
                  )}

                  {/* SCREEN 3: Add Money / Deposit View */}
                  {activeScreen === "add_money" && (
                    <div className="p-4 space-y-4">
                      
                      <button
                        onClick={() => {
                          setActiveScreen("home");
                          setDepositSuccessMsg("");
                        }}
                        className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-bold mb-1"
                      >
                        ←হোম পেজে ফিরে যান
                      </button>

                      {depositSuccessMsg ? (
                        <div className="bg-[#141624] border border-slate-800 rounded-2xl p-5 text-center space-y-3">
                          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/5">
                            <Check className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-100">রিকোয়েস্ট জমা হয়েছে!</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{depositSuccessMsg}</p>
                          <button
                            onClick={() => {
                              setActiveScreen("home");
                              setDepositSuccessMsg("");
                            }}
                            className="px-4 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg"
                          >
                            হোমে ফিরুন
                          </button>
                        </div>
                      ) : (
                        <div className="bg-[#141624] border border-slate-800 rounded-2xl p-4 space-y-4">
                          <div className="border-b border-slate-800 pb-2">
                            <h3 className="text-sm font-bold text-slate-200">Add Wallet Balance</h3>
                            <p className="text-[10px] text-slate-400">ব্যালেন্স লোড করে যেকোনো সময় তাত্ক্ষণিক টপ-আপ করুন</p>
                          </div>

                          {/* Payment method selector tabs */}
                          <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-[#0c0d14] rounded-lg">
                            {(["bkash", "nagad", "rocket"] as const).map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setDepositMethod(method)}
                                className={`py-1.5 text-xs font-bold rounded-md uppercase transition ${depositMethod === method ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>

                          {/* Instructions with numbers to copy */}
                          <div className="bg-[#0c0d14] border border-slate-850 rounded-xl p-3 text-[11px] space-y-2">
                            <p className="font-bold text-[10px] text-slate-300 capitalize">আমাদের {depositMethod} পার্সোনাল নম্বরে সেন্ডমানি করুন:</p>
                            
                            <div className="flex items-center justify-between bg-slate-900 rounded px-2.5 py-1.5 border border-slate-800">
                              <span className="font-mono text-slate-200 font-bold">01711223344</span>
                              <button
                                onClick={() => copyToClipboard("01711223344")}
                                className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                {copiedText === "01711223344" ? "Copied" : "Copy"}
                              </button>
                            </div>

                            <p className="text-slate-400 leading-relaxed text-[10px]">
                              টাকা সেন্ডমানি করা সম্পন্ন হলে নিচে ফর্মটি পূরণ করে ট্রানজেকশন ভেরিফাই করুন। এডমিন আপনার ট্রানজেকশন আইডির সত্যতা যাচাই করে দ্রুত ওয়ালেটে ব্যালেন্স এড করে দিবে।
                            </p>
                          </div>

                          {/* Deposit Form */}
                          <form onSubmit={handleAddMoney} className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Amount to Add (টাকার পরিমাণ)</label>
                              <div className="relative">
                                <span className="absolute left-3 inset-y-0 flex items-center text-slate-400 text-xs">TK</span>
                                <input
                                  type="number"
                                  value={depositAmount}
                                  onChange={(e) => setDepositAmount(e.target.value)}
                                  placeholder="e.g. 500"
                                  className="w-full bg-[#0c0d14] border border-slate-800 focus:border-violet-500 rounded-xl py-2 pl-9 pr-3 text-xs font-mono font-bold text-slate-200 focus:outline-none"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Your Sender Mobile (প্রেরক নম্বর)</label>
                              <input
                                type="text"
                                value={depositSender}
                                onChange={(e) => setDepositSender(e.target.value)}
                                placeholder="e.g. 017xxxxxxxx"
                                className="w-full bg-[#0c0d14] border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Transaction ID (TrxID)</label>
                              <input
                                type="text"
                                value={depositTxId}
                                onChange={(e) => setDepositTxId(e.target.value)}
                                placeholder="e.g. BKX9DJS9D2"
                                className="w-full bg-[#0c0d14] border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                                required
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={loadingState}
                              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-950/20"
                            >
                              {loadingState ? "রিকোয়েস্ট পাঠানো হচ্ছে..." : "VERIFY PAYMENT"}
                            </button>
                          </form>
                        </div>
                      )}

                    </div>
                  )}

                  {/* SCREEN 4: My Orders List */}
                  {activeScreen === "orders" && (
                    <div className="p-4 space-y-4">
                      
                      <button
                        onClick={() => setActiveScreen("home")}
                        className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-bold mb-1"
                      >
                        ←হোম পেজে ফিরে যান
                      </button>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <h3 className="text-sm font-bold text-slate-200">আমার অর্ডারসমূহ (Order History)</h3>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
                            Total: {orders.length}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 bg-violet-950/20 border border-violet-900/30 rounded-lg p-2 leading-relaxed">
                          ⚡ <strong>লাইভ অর্ডার ট্র্যাকার:</strong> আপনার পেন্ডিং অর্ডারটির লাইভ ডেলিভারি প্রগ্রেস এবং আনুমানিক সময় (ETA) রিয়েল-টাইমে নিচে ট্র্যাক করুন।
                        </p>

                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                          {orders.map((o) => (
                            <div key={o.id} className="bg-[#141624] border border-slate-850 rounded-xl p-3 space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-800/40 pb-1.5">
                                <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded">
                                  {o.id}
                                </span>
                                <span className="text-[10px] text-slate-400">{o.timestamp}</span>
                              </div>

                              <div className="flex justify-between items-start text-xs">
                                <div>
                                  <h4 className="font-bold text-slate-200">{o.productName}</h4>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Player UID: {o.playerUid}</p>
                                  <p className="text-[10px] text-slate-400">Payment: <span className="uppercase">{o.paymentMethod}</span></p>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-emerald-400 block">{o.price} TK</span>
                                  
                                  {/* Status Indicator */}
                                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded uppercase mt-1 ${
                                    o.status === "complete" ? "bg-emerald-950 text-emerald-400 ring-1 ring-emerald-500/20" :
                                    o.status === "processing" ? "bg-indigo-950 text-indigo-400 ring-1 ring-indigo-500/20 animate-pulse" :
                                    o.status === "failed" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400 animate-pulse"
                                  }`}>
                                    {o.status}
                                  </span>
                                </div>
                              </div>

                              {/* Live Delivery Progress Tracker for Pending/Processing Orders */}
                              {(o.status === "processing" || o.status === "pending") && (() => {
                                const startVal = o.createdAt || (new Date(o.timestamp.replace(' ', 'T')).getTime() || Date.now());
                                const duration = o.etaSeconds || 45;
                                const elapsedSeconds = Math.floor((now - startVal) / 1000);
                                const remainingSeconds = Math.max(0, duration - elapsedSeconds);
                                const progressPercent = Math.min(100, Math.max(0, (elapsedSeconds / duration) * 100));
                                
                                let statusLabel = "⏳ অর্ডার যাচাই করা হচ্ছে";
                                if (progressPercent >= 25 && progressPercent < 60) {
                                  statusLabel = "⚙️ আইডি ভেরিফিকেশন ও ডায়মন্ড বরাদ্দ";
                                } else if (progressPercent >= 60 && progressPercent < 90) {
                                  statusLabel = "🚀 ডায়মন্ড ট্রান্সফার করা হচ্ছে";
                                } else if (progressPercent >= 90) {
                                  statusLabel = "✨ অ্যাকাউন্ট আপডেট সম্পন্ন হচ্ছে";
                                }

                                return (
                                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-2">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-slate-400 flex items-center gap-1 font-medium">
                                        <Clock className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                                        ডেলিভারি আনুমানিক সময়:
                                      </span>
                                      <span className="font-bold text-violet-300 font-mono">
                                        {remainingSeconds > 0 ? `${remainingSeconds}s` : "ডেলিভারি সম্পন্ন হচ্ছে..."}
                                      </span>
                                    </div>

                                    {/* Progress Bar Container */}
                                    <div className="space-y-1">
                                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                                        <div 
                                          className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-1000"
                                          style={{ width: `${progressPercent}%` }}
                                        />
                                      </div>
                                      <div className="flex justify-between items-center text-[9px] text-slate-500">
                                        <span>{statusLabel}</span>
                                        <span className="font-mono font-bold text-slate-400">{Math.round(progressPercent)}%</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Completed State indicator */}
                              {o.status === "complete" && (
                                <div className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-1.5">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      ডেলিভারি স্ট্যাটাস:
                                    </span>
                                    <span className="font-bold text-emerald-400 text-[10px]">
                                      সফলভাবে ডেলিভারড!
                                    </span>
                                  </div>
                                  <div className="w-full h-1 bg-emerald-950 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-emerald-500 rounded-full" />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SCREEN 5: User Profile View */}
                  {activeScreen === "profile" && (
                    <div className="p-4 space-y-4">
                      
                      <button
                        onClick={() => setActiveScreen("home")}
                        className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-bold mb-1"
                      >
                        ←হোম পেজে ফিরে যান
                      </button>

                      <div className="bg-[#141624] border border-slate-800 rounded-2xl p-5 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full border-2 border-violet-500 bg-slate-900 overflow-hidden flex items-center justify-center mx-auto">
                          {wallet.userProfilePic ? (
                            <img src={wallet.userProfilePic} alt="User" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-slate-400" />
                          )}
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-200">{wallet.userName}</h3>
                          <p className="text-[10px] text-slate-400 font-mono">ID: 40291924</p>
                        </div>

                        {/* Stats card */}
                        <div className="grid grid-cols-2 gap-2 bg-[#0c0d14] rounded-xl p-3 border border-slate-850">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase block">Active Wallet</span>
                            <span className="text-sm font-bold font-mono text-emerald-400">{wallet.balance} TK</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase block">Total Orders</span>
                            <span className="text-sm font-bold font-mono text-violet-400">{orders.length}</span>
                          </div>
                        </div>

                        <div className="text-left text-xs text-slate-300 space-y-2 border-t border-slate-850 pt-3">
                          <p className="font-bold text-[10px] text-slate-400 uppercase">Account Details</p>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Email:</span>
                            <span className="text-slate-200 font-mono">taisirfoyej@gmail.com</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Joined:</span>
                            <span className="text-slate-200">July 2026</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Account Type:</span>
                            <span className="text-indigo-400 font-bold">Premium Customer</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SCREEN 6: Security Center & AI Chat */}
                  {activeScreen === "security" && (
                    <div className="p-4 space-y-4">
                      
                      <button
                        onClick={() => setActiveScreen("home")}
                        className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-bold mb-1"
                      >
                        ←হোম পেজে ফিরে যান
                      </button>

                      <div className="bg-[#141624] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        {/* Header banner */}
                        <div className="p-3.5 bg-gradient-to-r from-violet-600/30 to-indigo-600/20 border-b border-slate-800 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-violet-400 animate-pulse" />
                          <div>
                            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wide">টপআপ শিল্ড এআই</h3>
                            <span className="text-[9px] text-violet-300">AI Security & Trust Hub</span>
                          </div>
                        </div>

                        {/* Switch subtabs */}
                        <div className="flex bg-[#0c0d14] p-1 border-b border-slate-800">
                          <button
                            onClick={() => setMobileSecurityTab("scan")}
                            className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${mobileSecurityTab === "scan" ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                          >
                            অডিট স্ক্যানার
                          </button>
                          <button
                            onClick={() => setMobileSecurityTab("chat")}
                            className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${mobileSecurityTab === "chat" ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                          >
                            এআই চ্যাট হেল্প
                          </button>
                        </div>

                        {/* SUBTAB 1: AUDIT SCANNER */}
                        {mobileSecurityTab === "scan" && (
                          <div className="p-4 space-y-3">
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              যেকোনো টপ-আপ ওয়েবসাইটের ডোমেইন (যেমন <strong>topup-secure.com</strong>) লিখে অডিট করুন। এআই সাইটের নিরাপত্তা যাচাই করে স্কোর প্রদর্শন করবে।
                            </p>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={scanUrl}
                                onChange={(e) => setScanUrl(e.target.value)}
                                placeholder="e.g. topup-secure.com"
                                className="flex-1 bg-[#0c0d14] border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none"
                              />
                              <button
                                onClick={() => handleRunScan(scanUrl)}
                                disabled={scanning}
                                className="px-3 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-xl flex items-center gap-1 transition"
                              >
                                {scanning ? <RefreshCw className="w-3 h-3 animate-spin" /> : "স্ক্যান"}
                              </button>
                            </div>

                            {scanResult && (
                              <div className="space-y-3 pt-2 border-t border-slate-850">
                                <div className="flex items-center justify-between bg-[#0c0d14] rounded-xl p-2.5 border border-slate-850">
                                  <div className="leading-tight">
                                    <span className="text-[10px] font-mono font-bold text-slate-200 block truncate max-w-[130px]">{scanResult.url}</span>
                                    <span className="text-[9px] text-emerald-400">Ping: {scanResult.latencyMs}ms</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400">Trust:</span>
                                    <span className="text-xs font-black text-indigo-400 font-mono bg-indigo-950/40 px-1.5 py-0.5 rounded ring-1 ring-indigo-500/10">
                                      {scanResult.analysis?.trustScore || 0}/100
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                                  <div className={`p-1.5 rounded-lg border text-center ${scanResult.analysis?.isHttps ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' : 'bg-rose-950/20 border-rose-900/50 text-rose-400'}`}>
                                    SSL: {scanResult.analysis?.isHttps ? 'Active' : 'Missing'}
                                  </div>
                                  <div className={`p-1.5 rounded-lg border text-center ${scanResult.analysis?.payments.bkash || scanResult.analysis?.payments.shurjopay ? 'bg-indigo-950/20 border-indigo-900/50 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                                    Gateways: {scanResult.analysis?.payments.bkash ? 'Yes' : 'No'}
                                  </div>
                                </div>

                                <div className="bg-[#0c0d14] rounded-xl p-2.5 border border-slate-850 max-h-[140px] overflow-y-auto">
                                  <h4 className="text-[9px] font-bold text-violet-400 uppercase mb-1">এআই নিরাপত্তা রিপোর্ট:</h4>
                                  <div className="text-[10px] text-slate-300 leading-relaxed markdown-body">
                                    <ReactMarkdown>{scanResult.aiReport || ""}</ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* SUBTAB 2: AI CHAT HELP */}
                        {mobileSecurityTab === "chat" && (
                          <div className="flex flex-col h-[340px]">
                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar bg-[#0c0d14]">
                              {chatMessages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[90%] rounded-xl px-2.5 py-1.5 text-[10px] leading-relaxed ${msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-[#141624] border border-slate-850 text-slate-200'}`}
                                  >
                                    <div className="markdown-body prose prose-sm prose-invert text-[10px] leading-relaxed">
                                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {sendingChat && (
                                <div className="flex justify-start">
                                  <div className="bg-[#141624] border border-slate-850 text-slate-400 text-[9px] rounded-xl px-3 py-1.5 flex items-center gap-1">
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin text-slate-400" />
                                    টাইপিং...
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Chat input form */}
                            <div className="p-2 border-t border-slate-800 bg-[#141624]">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleSendChat();
                                }}
                                className="flex gap-1.5"
                              >
                                <input
                                  type="text"
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  placeholder="নিরাপদ টপআপ নিয়ে জিজ্ঞাসা করুন..."
                                  className="flex-1 bg-[#0c0d14] border border-slate-800 focus:border-violet-500 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-200 focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  disabled={sendingChat || !chatInput.trim()}
                                  className="p-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg transition"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* 3. Bottom Navigation Bar */}
                <div className="absolute bottom-0 inset-x-0 h-14 bg-[#0f111a] border-t border-slate-800/80 px-2 flex justify-between items-center z-30">
                  <button
                    onClick={() => setActiveScreen("home")}
                    className={`flex flex-col items-center justify-center flex-1 transition ${activeScreen === 'home' ? 'text-violet-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Smartphone className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px]">Home</span>
                  </button>

                  <button
                    onClick={() => setActiveScreen("add_money")}
                    className={`flex flex-col items-center justify-center flex-1 transition ${activeScreen === 'add_money' ? 'text-violet-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <CreditCard className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px]">Add Money</span>
                  </button>

                  <button
                    onClick={() => setActiveScreen("security")}
                    className={`flex flex-col items-center justify-center flex-1 transition ${activeScreen === 'security' ? 'text-violet-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Shield className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px]">Shield AI</span>
                  </button>

                  <button
                    onClick={() => setActiveScreen("orders")}
                    className={`flex flex-col items-center justify-center flex-1 transition ${activeScreen === 'orders' ? 'text-violet-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <ShoppingBag className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px]">Orders</span>
                  </button>

                  <button
                    onClick={() => setActiveScreen("profile")}
                    className={`flex flex-col items-center justify-center flex-1 transition ${activeScreen === 'profile' ? 'text-violet-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <User className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px]">Profile</span>
                  </button>
                </div>

                {/* Phone bottom bar indicator */}
                <div className="hidden lg:block absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-800 rounded-full z-40 pointer-events-none" />

              </div>
            </div>

          </section>

        </div>
      </main>

      {/* Floating Chatbot Assistant Widget */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full shadow-2xl shadow-violet-900/50 hover:scale-105 transition flex items-center gap-2 border border-violet-500/30"
          >
            <MessageSquare className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold font-sans">টপআপ শিল্ড এআই</span>
          </button>
        ) : (
          <div className="w-[320px] sm:w-[355px] h-[450px] bg-[#0f111a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Chat header */}
            <div className="bg-[#141624] px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">টপআপ শিল্ড সিকিউরিটি এআই</h4>
                  <p className="text-[9px] text-slate-400">cybersecurity advisor</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-[#181a27] border border-slate-800/80 text-slate-200 rounded-bl-none'}`}
                  >
                    <div className="markdown-body prose prose-sm prose-invert text-[11px] leading-relaxed">
                      <ReactMarkdown>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}

              {sendingChat && (
                <div className="flex justify-start">
                  <div className="bg-[#181a27] border border-slate-800 text-slate-400 text-[10px] rounded-2xl px-4 py-2 flex items-center gap-1.5 rounded-bl-none">
                    <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                    উত্তর ভাবছে...
                  </div>
                </div>
              )}
            </div>

            {/* Quick tips button shortcuts */}
            <div className="px-4 py-1.5 bg-[#0b0c13] flex gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-850">
              <button
                onClick={() => {
                  setChatInput("অনলাইন টপআপ কি নিরাপদ?");
                  // Allow next render to send
                  setTimeout(() => handleSendChat(), 50);
                }}
                className="flex-shrink-0 text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-full transition"
              >
                অনলাইন টপআপ কি নিরাপদ?
              </button>
              <button
                onClick={() => {
                  setChatInput("ডায়মন্ড টপআপ করার সঠিক নিয়ম কি?");
                  setTimeout(() => handleSendChat(), 50);
                }}
                className="flex-shrink-0 text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-full transition"
              >
                নিরাপদ টপআপ নিয়ম
              </button>
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChat} className="p-3 bg-[#131522] border-t border-slate-800 flex gap-2 items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="বাংলায় নিরাপদ টপআপ নিয়ে জিজ্ঞাসা করুন..."
                className="flex-1 bg-[#0c0d14] border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatInput.trim()}
                className="p-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}
      </div>

      {/* WATCH VIDEO TUTORIAL MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f111a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-850 bg-[#141624]">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <Youtube className="w-4.5 h-4.5 text-rose-600 fill-rose-600 animate-pulse" />
                কীভাবে সুরক্ষিতভাবে টপআপ করবেন?
              </h4>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              
              {/* Animated visual of player inputting UID and ordering */}
              <div className="bg-[#0c0d14] border border-slate-850 rounded-2xl p-4 text-center space-y-3 py-8">
                <div className="relative w-20 h-20 bg-violet-600/10 text-violet-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-violet-500/5 mb-2">
                  <Smartphone className="w-10 h-10 animate-bounce" />
                  <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                </div>
                <h5 className="text-xs font-bold text-slate-100">৩টি সহজ ধাপে টপআপ করার গাইডলাইন</h5>
                
                <div className="text-left space-y-2.5 max-w-xs mx-auto text-[11px] text-slate-300 pt-2">
                  <div className="flex gap-2 items-center">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-[10px]">১</span>
                    <span>ডানপাশের এমুলেটর থেকে **FREE FIRE (UID)** সিলেক্ট করুন।</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-[10px]">২</span>
                    <span>আপনার গেম UID দিয়ে পছন্দের ডায়মন্ড প্যাকটি বাছুন।</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-[10px]">৩</span>
                    <span>**Wallet Pay** অথবা **bKash/Nagad** দিয়ে অর্ডার কনফার্ম করুন।</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400">
                আমাদের অটোমেটেড প্যানেলে মাত্র ৫ মিনিটে ডায়মন্ড আপনার ফ্রি ফায়ার আইডিতে জমা হয়ে যাবে।
              </div>
            </div>

            <div className="bg-[#121420] px-5 py-3 flex justify-end border-t border-slate-850">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition"
              >
                বুঝেছি, ধন্যবাদ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce-short">
          <div className={`px-4 py-3 rounded-xl border shadow-2xl text-xs flex items-center gap-2.5 ${
            toast.type === "success" ? "bg-emerald-950 border-emerald-500/40 text-emerald-300" :
            toast.type === "error" ? "bg-rose-950 border-rose-500/40 text-rose-300" :
            "bg-slate-900 border-slate-700 text-slate-300"
          }`}>
            <div className="p-1 rounded-full bg-black/20">
              {toast.type === "success" ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            </div>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
