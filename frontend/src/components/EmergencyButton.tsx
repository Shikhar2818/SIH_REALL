import React, { useState } from 'react';
import { Phone, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmergencyButtonProps {
  className?: string;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({ className = '' }) => {
  const [showModal, setShowModal] = useState(false);

  const emergencyNumbers = [
    { number: '112', label: 'Emergency Services', description: 'Universal Emergency Number - All Emergencies', icon: '🚨' },
    { number: '100', label: 'Police', description: 'Police Emergency', icon: '👮' },
    { number: '108', label: 'Medical Emergency', description: 'Ambulance Service', icon: '🚑' },
    { number: '104', label: 'Medical Helpline', description: 'Medical Assistance & Advice', icon: '🏥' },
    { number: '1066', label: 'Anti-Poison Centre', description: 'Delhi Anti-Poison Information Centre', icon: '☠️' },
  ];

  const mentalHealthNumbers = [
    { number: '1800-599-0019', label: 'KIRAN', description: 'Mental Health Helpline (24/7)', icon: '💚' },
    { number: '+91-9999666555', label: 'Vandrevala Foundation', description: 'Mental Health Support (24/7)', icon: '🤝' },
    { number: '+91-9820466726', label: 'AASRA', description: 'Suicide Prevention (24/7)', icon: '🆘' },
    { number: '+91-9152987821', label: 'iCALL', description: 'Mental Health Support (Mon-Sat, 10 AM-8 PM)', icon: '📞' },
  ];

  const handleCall = (number: string) => {
    // Create a phone link that will work on mobile devices
    const phoneLink = `tel:${number}`;
    window.open(phoneLink, '_self');
  };

  return (
    <>
      {/* Emergency Button */}
      <motion.button
        onClick={() => setShowModal(true)}
        className={`bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-lg hover:shadow-xl ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Emergency Helplines"
      >
        <AlertTriangle className="w-4 h-4" />
      </motion.button>

      {/* Emergency Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-red-600 text-white p-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-bold">Emergency Helplines</h2>
                      <p className="text-red-100 text-sm">Immediate help when you need it most</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-red-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Emergency Services */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    Emergency Services
                  </h3>
                  <div className="grid gap-3">
                    {emergencyNumbers.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCall(item.number)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="font-semibold">{item.number}</span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Mental Health Support */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">💚</span>
                    Mental Health Support
                  </h3>
                  <div className="grid gap-3">
                    {mentalHealthNumbers.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (emergencyNumbers.length + index) * 0.1 }}
                        className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCall(item.number)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="font-semibold">{item.number}</span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Important Notice</h4>
                      <p className="text-sm text-yellow-700">
                        These helplines are available 24/7 for immediate assistance. If you're in immediate danger, 
                        call 112 or 100 right away. Your safety and wellbeing are our top priority.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencyButton;
