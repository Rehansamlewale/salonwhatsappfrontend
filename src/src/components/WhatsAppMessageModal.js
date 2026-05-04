import React, { useState, useEffect } from 'react';
import { ref, push, set, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../firebase';
import { FaWhatsapp, FaTimes, FaHistory, FaPaperPlane } from 'react-icons/fa';

const WhatsAppMessageModal = ({ isOpen, onClose, customer }) => {
    const [message, setMessage] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    useEffect(() => {
        if (isOpen && customer?.id) {
            loadHistory();
        }
        
        // Load templates
        const templatesRef = ref(database, 'whatsapp_templates');
        const unsubscribe = onValue(templatesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const templatesList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setTemplates(templatesList);
            } else {
                setTemplates([]);
            }
        });
        
        return () => unsubscribe();
    }, [isOpen, customer]);

    const handleTemplateChange = (e) => {
        const tId = e.target.value;
        setSelectedTemplateId(tId);
        
        if (tId) {
            const template = templates.find(t => t.id === tId);
            if (template && template.content) {
                // Replace placeholders
                let msg = template.content;
                msg = msg.replace(/{name}/g, customer?.name || '');
                msg = msg.replace(/{mobile}/g, customer?.mobile1 || '');
                msg = msg.replace(/{city}/g, customer?.city || customer?.customer_details?.basic_info?.city_village || '');
                msg = msg.replace(/{loanType}/g, customer?.loanType || '');
                msg = msg.replace(/{loanAmount}/g, customer?.loanAmount || '');
                setMessage(msg);
                setMediaUrl(template.mediaUrl || '');
            }
        } else {
            setMessage('');
            setMediaUrl('');
        }
    };

    const loadHistory = () => {
        if (!customer?.id) return;
        const messagesRef = ref(database, 'messages');
        const q = query(messagesRef, orderByChild('customer_id'), equalTo(customer.id));
        
        onValue(q, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const messagesList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
                setHistory(messagesList);
            } else {
                setHistory([]);
            }
        });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        try {
            const currentUser = auth.currentUser;
            const messagesRef = ref(database, 'messages');
            const newMessageRef = push(messagesRef);
            
            const messageData = {
                id: newMessageRef.key,
                customer_id: customer.id,
                message: message,
                status: 'Sent',
                sent_at: new Date().toISOString(),
                sent_by: currentUser?.uid || 'system'
            };

            await set(newMessageRef, messageData);
            
            // Format phone number
            let phone = customer.mobile1 || customer.phone || '';
            phone = phone.replace(/\D/g, '');
            if (phone.length === 10) phone = '91' + phone;

            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
            
            setMessage('');
            setLoading(false);
        } catch (error) {
            console.error('Error sending message:', error);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-green-600 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FaWhatsapp className="text-2xl" />
                        <h2 className="text-xl font-bold">WhatsApp Message</h2>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-green-200 transition-colors">
                        <FaTimes className="text-xl" />
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <p className="font-semibold text-gray-800">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.mobile1}</p>
                    </div>
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm font-medium"
                    >
                        <FaHistory />
                        {showHistory ? 'Write Message' : 'History'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {showHistory ? (
                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No message history found.</p>
                            ) : (
                                history.map(msg => (
                                    <div key={msg.id} className="bg-green-50 p-3 rounded-xl border border-green-100">
                                        <p className="text-gray-800 text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                            <span>{new Date(msg.sent_at).toLocaleString()}</span>
                                            <span className="text-green-600 font-medium">{msg.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="space-y-4">
                            {templates.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
                                    <select
                                        value={selectedTemplateId}
                                        onChange={handleTemplateChange}
                                        className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                    >
                                        <option value="">-- Choose a template --</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your WhatsApp message here..."
                                    className="w-full h-24 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none outline-none text-sm"
                                    required
                                />
                            </div>

                            {/* WhatsApp Preview Block */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Live Preview</label>
                                <div className="bg-[#EFEAE2] rounded-xl p-3 shadow-inner min-h-[150px] border border-gray-200 flex flex-col items-end" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: 'cover' }}>
                                    {message || mediaUrl ? (
                                        <div className="bg-[#dcf8c6] p-2 rounded-xl shadow max-w-[90%] relative mt-1" style={{ borderTopRightRadius: 0 }}>
                                            <div className="absolute top-0 -right-2 w-0 h-0 border-t-[10px] border-t-[#dcf8c6] border-r-[10px] border-r-transparent"></div>
                                            
                                            {mediaUrl && (
                                                <div className="mb-1 rounded-lg overflow-hidden border border-[#c1e6a6]">
                                                    <img src={mediaUrl} alt="Attached Media" className="w-full max-h-32 object-cover" />
                                                </div>
                                            )}
                                            {message && (
                                                <div className="text-[13px] whitespace-pre-wrap font-sans text-gray-800 px-1 pb-3">
                                                    {message}
                                                </div>
                                            )}
                                            <div className="text-[10px] text-gray-500 text-right mt-[-14px] px-1 flex justify-end items-center gap-1 relative z-10">
                                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                <span className="text-blue-500 text-[12px] leading-none">✓✓</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white/90 px-3 py-1.5 rounded-lg self-center mt-10 text-xs text-gray-500 shadow-sm text-center">
                                            Preview will appear here...
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !message.trim()}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <FaPaperPlane />
                                        Send via WhatsApp
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatsAppMessageModal;
