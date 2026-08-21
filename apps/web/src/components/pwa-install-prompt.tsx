'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Tipagem para o evento beforeinstallprompt (não padronizado ainda no TS)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error - iOS standalone
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    return Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsIOSDevice(isIOS());
    setIsInstalled(isStandalone());

    if (isStandalone() || wasRecentlyDismissed()) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay para não ser intrusivo: mostra após 3s
      setTimeout(() => setShowPrompt(true), 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Para iOS (que não dispara beforeinstallprompt), mostrar banner manual se não instalado
    if (isIOS() && !isStandalone() && !wasRecentlyDismissed()) {
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS fallback: apenas dismiss, instrução visual já está no banner
      dismiss();
      return;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch {
      // ignore
    } finally {
      setShowPrompt(false);
      setDeferredPrompt(null);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {}
    }
  };

  if (isInstalled || !showPrompt) return null;

  // UI: banner inferior, não bloqueante, acima do BottomNav (pb-16 no mobile)
  return (
    <div
      role="dialog"
      aria-label="Instalar aplicativo FoodLeap"
      className="fixed inset-x-0 bottom-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-4 md:left-1/2 md:max-w-lg md:-translate-x-1/2"
    >
      <div className="relative flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={dismiss}
          aria-label="Fechar"
          className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25">
          <Smartphone className="h-6 w-6" />
        </div>

        <div className="flex-1 pr-6">
          <p className="text-sm font-semibold leading-none">Instale o app FoodLeap</p>
          {isIOSDevice ? (
            <p className="mt-1 flex items-center gap-1 text-xs leading-tight text-muted-foreground">
              Toque em <Share className="inline h-3 w-3" /> Compartilhar e depois &quot;Adicionar à Tela de Início&quot;
            </p>
          ) : (
            <p className="mt-1 text-xs leading-tight text-muted-foreground">
              Acesso rápido, funciona offline e receita todo dia às 8h.
            </p>
          )}
        </div>

        {!isIOSDevice && deferredPrompt ? (
          <Button
            onClick={handleInstall}
            size="sm"
            className="shrink-0 rounded-full bg-zinc-900 px-5 font-semibold text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-100"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Instalar
          </Button>
        ) : isIOSDevice ? (
          <Button
            onClick={dismiss}
            variant="secondary"
            size="sm"
            className="shrink-0 rounded-full"
          >
            Entendi
          </Button>
        ) : null}
      </div>
    </div>
  );
}
