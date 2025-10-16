import React, { type JSX } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error';

interface NotificationProps {
  message: string;
  type?: NotificationType;
  onClose?: () => void;
}

const typeStyles: Record<NotificationType, { container: string; icon: JSX.Element }> = {
  success: {
    container: 'bg-green-600/90 text-white',
    icon: <CheckCircle size={20} className="text-white shrink-0" />,
  },
  error: {
    container: 'bg-red-600/90 text-white',
    icon: <AlertTriangle size={20} className="text-white shrink-0" />,
  },
};

export const Notification: React.FC<NotificationProps> = ({ message, type = 'success', onClose }) => {
  const styles = typeStyles[type];

  return (
    <div className={`pointer-events-auto flex items-center gap-3 rounded-md px-4 py-3 shadow-lg ${styles.container}`}>
      {styles.icon}
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
