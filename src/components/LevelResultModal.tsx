import React, { useEffect } from 'react';
import { Star, RotateCcw, Map, ArrowRight, Award, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameResultData } from '../types';
import { sound } from '../utils/audio';

interface LevelResultModalProps {
  result: GameResultData;
  onReturnToMap: () => void;
  onNextLevel?: () => void;
  onRestartLevel: () => void;
  hasNextLevel: boolean;
}

export const LevelResultModal: React.FC<LevelResultModalProps> = ({
  result,
  onReturnToMap,
  onNextLevel,
  onRestartLevel,
  hasNextLevel,
}) => {
  const isPass = result.stars > 0;

  useEffect(() => {
    // Sound effect and confetti
    if (result.stars > 0) {
      setTimeout(() => sound.playStar(1), 300);
      if (result.stars >= 2) setTimeout(() => sound.playStar(2), 650);
      if (result.stars >= 3) {
        setTimeout(() => {
          sound.playStar(3);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }, 1000);
      }
    } else {
      sound.playFail();
    }
  }, [result.stars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 border-4 border-amber-500 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-center relative p-6">
        {/* Banner Header */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-8 py-1.5 rounded-b-2xl font-black font-['Fredoka'] text-sm tracking-wider uppercase shadow-md">
          {isPass ? 'Waktu Habis — Level Selesai!' : 'Waktu Habis — Coba Lagi!'}
        </div>

        {/* Level Title */}
        <div className="mt-5 mb-3">
          <h2 className="text-2xl font-black font-['Fredoka'] text-slate-800">{result.levelTitle}</h2>
          <p className="text-xs font-semibold text-slate-500">
            {isPass ? 'Pekerjaan koki yang luar biasa!' : 'Skor belum mencukupi untuk 1 bintang. Jangan menyerah!'}
          </p>
        </div>

        {/* Stars Display */}
        <div className="flex justify-center items-center gap-3 my-4">
          {[1, 2, 3].map((starIdx) => {
            const earned = starIdx <= result.stars;
            return (
              <div
                key={starIdx}
                className={`relative transition-all duration-500 transform ${
                  earned ? 'scale-110' : 'scale-95 opacity-40'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center border-3 shadow-md ${
                    earned
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 border-amber-500 text-white shadow-amber-300/60 animate-bounce'
                      : 'bg-slate-200 border-slate-300 text-slate-400'
                  }`}
                  style={{ animationDelay: `${starIdx * 250}ms`, animationIterationCount: 2 }}
                >
                  <Star className={`w-10 h-10 ${earned ? 'fill-white' : 'fill-slate-300'}`} />
                </div>
                {earned && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black bg-amber-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                    ★ {starIdx}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Unlock Alert */}
        {result.isNewUnlock && result.unlockedLevelId && (
          <div className="mb-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-emerald-900 animate-pulse">
            <Trophy className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-black">Level {result.unlockedLevelId} Baru Saja Terbuka di World Map!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="bg-white/90 rounded-2xl border-2 border-amber-200 p-4 mb-5 shadow-sm space-y-2.5 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-amber-100">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Total Skor
            </span>
            <span className="text-2xl font-black font-['Fredoka'] text-amber-600">
              {result.score} <span className="text-xs font-bold text-slate-400">pts</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Pesanan Berhasil Diselesaikan
            </span>
            <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {result.completedOrders} pesanan
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-500" />
              Pesanan Gagal / Hangus
            </span>
            <span className="text-sm font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
              {result.failedOrders} pesanan
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {isPass && hasNextLevel && onNextLevel && (
            <button
              id="btn-result-next-level"
              onClick={() => {
                sound.playClick();
                onNextLevel();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black font-['Fredoka'] text-base rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border-b-4 border-emerald-700"
            >
              <span>Lanjut ke Level Berikutnya</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-result-restart"
              onClick={() => {
                sound.playClick();
                onRestartLevel();
              }}
              className="py-3 px-3 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-amber-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>

            <button
              id="btn-result-return-map"
              onClick={() => {
                sound.playClick();
                onReturnToMap();
              }}
              className="py-3 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Map className="w-4 h-4" />
              <span>Kembali ke Peta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
