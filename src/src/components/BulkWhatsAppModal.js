import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../firebase';
import { FaWhatsapp, FaTimes, FaRobot, FaCopy } from 'react-icons/fa';
import WhatsAppAPIIntegration from './WhatsAppAPIIntegration';

const BulkWhatsAppModal = ({ isOpen, onClose, selectedContacts }) => {
    const [message, setMessage] = useState('');
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [showAPIIntegration, setShowAPIIntegration] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const templatesRef = ref(database, 'whatsapp_templates');
        const unsubscribe = onValue(templatesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const templatesList = Object.entries(data).map(([id, values]) => ({
                    id,
                    ...values
                }));
                setTemplates(templatesList);
            } else {
                setTemplates([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleTemplateSelect = (e) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);
        if (templateId === '') {
            setMessage('');
            setMediaUrl('');
            return;
        }
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setMessage(template.content);
            setMediaUrl(template.mediaUrl || '');
        }
    };

    const getFinalMessage = (contact) => {
        if (!message) return '';
        let msg = message;
        const replacements = {
            '{name}': contact?.name || '',
            '{mobile}': contact?.mobile1 || contact?.mobile || '',
            '{loanType}': contact?.loanType || '',
            '{date}': new Date().toLocaleDateString('en-IN')
        };

        Object.entries(replacements).forEach(([key, value]) => {
            const regex = new RegExp(key, 'g');
            msg = msg.replace(regex, value);
        });
        return msg;
    };

    const handleCopy = async () => {
        const sampleMessage = selectedContacts.length > 0 ? getFinalMessage(selectedContacts[0]) : message;
        try {
            await navigator.clipboard.writeText(sampleMessage);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex items-center justify-between bg-purple-50">
                    <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                        <FaWhatsapp className="text-green-500" /> Bulk WhatsApp Message
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Side: Editor */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Template</label>
                                <select
                                    value={selectedTemplateId}
                                    onChange={handleTemplateSelect}
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition-all"
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Message Content</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here... Use {name} for dynamic name."
                                    className="w-full h-48 px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none transition-all resize-none text-sm"
                                />
                            </div>

                            {mediaUrl && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Attachment Preview</label>
                                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-100">
                                        <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Preview */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-3xl p-6 border-2 border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-gray-700 uppercase tracking-wider text-xs">Sample Preview (1st Contact)</h4>
                                    <button
                                        onClick={handleCopy}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1"
                                    >
                                        <FaCopy /> {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="bg-[#EFEAE2] rounded-2xl p-4 shadow-inner min-h-[250px] relative overflow-hidden" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: 'cover' }}>
                                    <div className="bg-white p-3 rounded-xl shadow-sm max-w-[90%] float-left relative">
                                        {mediaUrl && (
                                            <img src={mediaUrl} alt="Media" className="w-full h-32 object-cover rounded-lg mb-2" />
                                        )}
                                        <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                            {selectedContacts.length > 0 ? getFinalMessage(selectedContacts[0]) : 'No contacts selected'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                <p className="text-sm text-purple-700 font-semibold">
                                    Recipients: {selectedContacts.length} contacts selected
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAPIIntegration(true)}
                                disabled={!message || selectedContacts.length === 0}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaRobot className="text-xl" />
                                <span>Send to {selectedContacts.length} Contacts</span>
                            </button>
                        </div>
                    </div>
                </div>

                {showAPIIntegration && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAPIIntegration(false)}></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b flex items-center justify-between bg-green-50">
                                <h4 className="text-xl font-bold text-green-800 flex items-center gap-2">
                                    <FaRobot /> Automated Sending
                                </h4>
                                <button onClick={() => setShowAPIIntegration(false)} className="text-gray-400 hover:text-gray-600">
                                    <FaTimes size={24} />
                                </button>
                            </div>
                            <WhatsAppAPIIntegration
                                message={message}
                                mediaUrl={mediaUrl}
                                selectedContacts={selectedContacts}
                                onSendComplete={async (results) => {
                                    // Handle complete
                                    if (results && results.length > 0) {
                                        const updates = {};
                                        const timestamp = new Date().toISOString();
                                        results.forEach(res => {
                                            if (res.success && res.contact?.id) {
                                                updates[`customers/${res.contact.id}/lastMessageSentAt`] = timestamp;
                                            }
                                        });
                                        if (Object.keys(updates).length > 0) {
                                            try {
                                                await update(ref(database), updates);
                                                console.log('Updated lastMessageSentAt for', Object.keys(updates).length, 'customers');
                                            } catch (err) {
                                                console.error('Failed to update lastMessageSentAt', err);
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkWhatsAppModal;
