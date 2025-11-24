
import React, { useState, useRef, useEffect } from 'react';
import { Send, UserCircle, Leaf, ScanBarcode, X, Sparkles, Settings, AlertTriangle, KeyRound } from 'lucide-react';
import { Message, AgentRole, ProductData, UserProfile } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ProfileModal } from './components/ProfileModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { parseUserIntent, findIngredientsViaWeb, consultNutritionist, identifyProductFromImage } from './services/geminiService';
import { searchOpenFoodFacts, searchByBarcode } from './services/foodService';
import { STORAGE_KEYS } from './constants';

const SUGGESTIONS = [
  { text: "Is Coke Zero safe for diabetics?", label: "Check a Condition" },
  { text: "I have high blood pressure, can I eat Doritos?", label: "Ask about Safety" },
  { text: "Find a healthy alternative to Snickers", label: "Get Recommendations" },
  { text: "5449000000996", label: "Search by Barcode" }
];

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  // Data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }

      const disclaimerAccepted = localStorage.getItem(STORAGE_KEYS.DISCLAIMER);
      if (!disclaimerAccepted) {
        setShowDisclaimer(true);
      }

      // Check for API Key
      const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
      if (savedKey || process.env.API_KEY) {
        setHasApiKey(true);
      } else {
        setIsKeyModalOpen(true); // Force open if missing
      }

    } catch (e) {
      console.error("Failed to load local storage data", e);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem(STORAGE_KEYS.DISCLAIMER, 'true');
    setShowDisclaimer(false);
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    addMessage({
      id: Date.now().toString(),
      role: AgentRole.CONSULTANT,
      text: `Profile updated! I will now tailor my advice for: ${profile.conditions || 'General Health'} ${profile.goals ? `and your goal to ${profile.goals}` : ''}.`,
      timestamp: Date.now()
    });
  };

  const handleSaveKey = () => {
    setHasApiKey(true);
    setIsKeyModalOpen(false);
    // Removed the automatic welcome message here to keep user on home screen
  };
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const updateLastMessage = (updates: Partial<Message>) => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length === 0) return prev;
      const lastMsg = newMessages[newMessages.length - 1];
      newMessages[newMessages.length - 1] = { ...lastMsg, ...updates };
      return newMessages;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  const handleSend = async (e?: React.FormEvent, manualInput?: string) => {
    e?.preventDefault();
    
    // Check API Key first
    if (!hasApiKey) {
      setIsKeyModalOpen(true);
      return;
    }

    const textToSend = manualInput || input;
    if ((!textToSend.trim() && !selectedImage) || isProcessing) return;

    const userText = textToSend.trim();
    const userImage = selectedImage;

    setInput('');
    clearImage();
    setIsProcessing(true);

    addMessage({
      id: Date.now().toString(),
      role: AgentRole.USER,
      text: userText || (userImage ? "Analyzed uploaded image" : ""),
      timestamp: Date.now()
    });

    try {
      const aiMsgId = (Date.now() + 1).toString();
      addMessage({
        id: aiMsgId,
        role: AgentRole.CONSULTANT,
        text: "Thinking...",
        isThinking: true,
        thinkingStep: userImage ? "Scanning image..." : "Analyzing your request...",
        timestamp: Date.now()
      });

      let productData: ProductData | null = null;
      let intentProductName: string | null = null;
      let intentHealthCondition: string | null = null;

      if (userImage) {
        const base64Data = userImage.split(',')[1];
        const scanResult = await identifyProductFromImage(base64Data);

        if (scanResult.barcode) {
          updateLastMessage({ thinkingStep: `Found barcode: ${scanResult.barcode}. Searching database...` });
          productData = await searchByBarcode(scanResult.barcode);
        }
        
        if (!productData && scanResult.productName) {
           updateLastMessage({ thinkingStep: `Identified product: ${scanResult.productName}. Searching database...` });
           intentProductName = scanResult.productName;
           productData = await searchOpenFoodFacts(scanResult.productName);
        }

        if (!productData && !scanResult.productName) {
           updateLastMessage({ 
             isThinking: false, 
             text: "I couldn't identify a clear barcode or product name in that image. Please try again or type the product name." 
           });
           setIsProcessing(false);
           return;
        }
      }

      if (userText) {
        const isBarcode = /^\d+$/.test(userText);

        if (isBarcode) {
           updateLastMessage({ thinkingStep: `Detected barcode ${userText}. Searching database...` });
           productData = await searchByBarcode(userText);
           if (productData) {
             intentProductName = productData.name;
           }
        } else {
           const intent = await parseUserIntent(userText);
           if (!productData && !intentProductName) {
              intentProductName = intent.productName;
              if (intentProductName) {
                updateLastMessage({ thinkingStep: `Searching ingredients for ${intentProductName}...` });
                productData = await searchOpenFoodFacts(intentProductName);
              }
           }
           intentHealthCondition = intent.healthCondition;
        }
      }

      if (!productData && intentProductName) {
         updateLastMessage({ thinkingStep: `Checking web sources for ${intentProductName}...` });
         productData = await findIngredientsViaWeb(intentProductName);
      }

      if (!productData) {
        updateLastMessage({
          isThinking: false,
          text: "I couldn't find any product matching your request. Please try providing a valid product name, barcode number, or clear image."
        });
        setIsProcessing(false);
        return;
      }

      const displayCondition = intentHealthCondition || "your personal profile";
      
      updateLastMessage({
        thinkingStep: `Analyzing impact on ${displayCondition}...`
      });

      const analysis = await consultNutritionist(productData, intentHealthCondition, userProfile);

      updateLastMessage({
        isThinking: false,
        text: `I've analyzed **${productData.name}** for **${displayCondition}**.`,
        productData: productData,
        analysis: analysis
      });

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message === 'API_KEY_MISSING' 
        ? "Missing API Key. Please configure it in the settings."
        : "I encountered a system error. Please check your connection or API key and try again.";
        
      updateLastMessage({
        isThinking: false,
        text: errorMessage
      });
      
      if (error.message === 'API_KEY_MISSING') {
        setIsKeyModalOpen(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <DisclaimerModal isOpen={showDisclaimer} onAccept={handleAcceptDisclaimer} />
      
      <ApiKeyModal 
        isOpen={isKeyModalOpen} 
        onSave={handleSaveKey} 
        onClose={() => setIsKeyModalOpen(false)}
        canClose={hasApiKey} 
      />
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        currentProfile={userProfile}
        onSave={handleSaveProfile}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Leaf className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">NutriAgent AI</h1>
            <p className="text-xs text-slate-500">Personal Food Consultant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsKeyModalOpen(true)}
            className={`p-2 rounded-lg border transition-all ${!hasApiKey ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            title="Configure API Key"
          >
            <KeyRound size={20} />
          </button>

          <button 
            onClick={() => setIsProfileOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all
              ${userProfile 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
            `}
          >
            {userProfile ? (
              <div className="flex items-center gap-2">
                 <span className="text-xs font-semibold hidden sm:inline">{userProfile.name}</span>
                 <Settings size={16} />
              </div>
            ) : (
               <>
                 <UserCircle size={20} />
                 <span className="text-xs font-medium hidden sm:inline">Create Profile</span>
               </>
            )}
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 opacity-100 animate-fadeIn">
            <div className="bg-white p-4 rounded-full mb-6 shadow-md border border-slate-100 ring-4 ring-slate-50">
               <Sparkles size={32} className="text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">NutriAgent AI</h2>
            <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
              I can analyze ingredients, scan barcodes, and check if food is safe for <b>any health condition</b>.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <span className="block text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 group-hover:text-indigo-600">
                    {suggestion.label}
                  </span>
                  <span className="text-sm text-slate-700 font-medium">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>

             <div className="mt-8">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform active:scale-95 font-medium"
               >
                 <ScanBarcode size={20} />
                 Scan Product Barcode
               </button>
             </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto relative">
          
          {selectedImage && (
            <div className="absolute -top-16 left-0 bg-white p-1 rounded-lg border border-slate-200 shadow-md flex items-start animate-slideUp">
               <img src={selectedImage} alt="Preview" className="h-12 w-12 object-cover rounded" />
               <button 
                onClick={clearImage}
                className="ml-1 text-slate-400 hover:text-red-500"
               >
                 <X size={14} />
               </button>
            </div>
          )}

          <form onSubmit={(e) => handleSend(e)} className="relative flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
              capture="environment" 
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-2xl transition-colors"
              title="Scan Barcode / Upload Image"
            >
              <ScanBarcode size={20} />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={userProfile ? "Ask about a product..." : "Ask about a product..."}
                className="w-full bg-slate-100 border-0 text-slate-800 placeholder-slate-400 rounded-2xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || isProcessing}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-2 rounded-xl transition-colors shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
          <div className="flex items-center justify-center gap-2 mt-3 opacity-60 hover:opacity-100 transition-opacity">
            <AlertTriangle size={12} className="text-red-500" />
            <p className="text-[10px] text-slate-500 font-medium">
              Not medical advice. Verify ingredients. Consult a physician for severe conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;