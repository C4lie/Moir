import { useRegisterSW } from 'virtual:pwa-register/react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 p-4 bg-white rounded-xl shadow-lg border border-sage-200 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sage-900 mb-1">
                {offlineReady ? 'App ready to work offline' : 'New content available'}
              </h3>
              <p className="text-sm text-sage-600 mb-3">
                {offlineReady
                  ? 'You can now use Moir without an internet connection.'
                  : 'Click reload to update to the latest version.'}
              </p>
              {needRefresh && (
                <button
                  onClick={() => updateServiceWorker(true)}
                  className="btn-primary py-1.5 px-3 text-sm flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Reload
                </button>
              )}
            </div>
            <button
              onClick={close}
              className="text-sage-400 hover:text-sage-600 p-1 rounded-full hover:bg-sage-50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ReloadPrompt
