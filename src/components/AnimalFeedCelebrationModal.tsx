import React from 'react';
import { ANIMAL_FEEDING_QUOTES } from '../config';
import { Sparkles, Heart, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnimalFeedCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelterName: string;
  qty: number;
  deliveryType: 'self' | 'transport';
  fare?: number;
}

export const AnimalFeedCelebrationModal: React.FC<AnimalFeedCelebrationModalProps> = ({
  isOpen,
  onClose,
  shelterName,
  qty,
  deliveryType,
  fare
}) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  // Pick an inspiring quote
  const randomQuote = ANIMAL_FEEDING_QUOTES[Math.floor(Math.random() * ANIMAL_FEEDING_QUOTES.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden transform animate-in zoom-in-95 duration-200 p-6 sm:p-8 text-center space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Badges */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 animate-bounce mb-3">
            <Heart className="w-8 h-8 fill-white" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Zero-Waste Animal Rescue Milestone</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Compassion In Action!
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            You just ensured that not a single grain of food was wasted.
          </p>
        </div>

        {/* Inspiring Quote Box */}
        <div className="bg-gradient-to-br from-amber-50/70 to-emerald-50/50 rounded-2xl p-5 border border-amber-200/60 text-left relative">
          <span className="text-3xl text-amber-400 font-serif absolute -top-2 left-3">“</span>
          <p className="text-sm font-semibold text-slate-800 italic leading-relaxed pt-1 pl-3">
            {randomQuote.quote}
          </p>
          <div className="text-right text-xs font-bold text-amber-800 mt-2">
            — {randomQuote.author}
          </div>
        </div>

        {/* Impact Summary Details */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-3 text-left text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Recipient Sanctuary</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">
              {shelterName}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Food Diverted</span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
              {qty} plates (0 kg landfill)
            </span>
          </div>

          <div className="col-span-2 pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">
              Handover Method:
            </span>
            <span className="font-semibold text-slate-800">
              {deliveryType === 'self'
                ? '🚗 Donor Self-Drop'
                : `🚚 Goodwill Courier ${fare ? `(₹${fare} paid by Donor)` : ''}`}
            </span>
          </div>
        </div>

        {/* Complete Order Action */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose();
              navigate('/donor/orders');
            }}
            className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Order Complete — View My Orders</span>
          </button>
        </div>
      </div>
    </div>
  );
};
