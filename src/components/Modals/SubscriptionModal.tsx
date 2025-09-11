import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../context/FirebaseContext';
import { useAuth } from '../../context/AuthContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { db, app } = useFirebase();
  const { user, logout } = useAuth();

  const appId = app.options.projectId || '';

  const handleSubscribe = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
      await updateDoc(userDocRef, { subscriptionStatus: 'active' });
      onClose();
      // Reload the page to refresh the session
      window.location.reload();
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div id="subscription-modal" className="fixed inset-0 bg-slate-900 bg-opacity-80 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl text-center">
        <i className="fas fa-sad-tear text-5xl text-amber-500 mb-4"></i>
        <h2 className="text-2xl font-bold mb-2 text-slate-800">Masa Percobaan Anda Telah Berakhir</h2>
        <p className="text-slate-600 mb-6">
          Untuk terus menggunakan semua fitur canggih aplikasi ini, silakan lanjutkan dengan berlangganan.
        </p>
        <button
          onClick={handleSubscribe}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-semibold text-lg hover:scale-105 transition-transform"
        >
          <i className="fas fa-rocket mr-2"></i>Lanjutkan Berlangganan
        </button>
        <button
          onClick={logout}
          className="mt-4 text-slate-500 hover:text-slate-700 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SubscriptionModal;