import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the default install prompt
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our custom install UI
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the saved prompt
    setDeferredPrompt(null);
    setShowPrompt(false);

    console.log(`User ${outcome} the install prompt`);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Still keep the deferredPrompt in case they want to install later
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-r from-sage-700 to-sage-600 rounded-2xl shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="bg-white/10 p-2 rounded-lg flex-shrink-0">
            <Download size={24} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">Install Moir</h3>
            <p className="text-sage-100 text-sm mb-3">
              Add to your home screen for quick access and offline use.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-white text-sage-700 hover:bg-sage-50 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors text-sm"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
