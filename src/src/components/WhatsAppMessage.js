import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ref, get, set, push, remove, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../firebase';
import WhatsAppAPIIntegration from './WhatsAppAPIIntegration';
import whatsappAPI from '../services/whatsappAPI';
import { FaWhatsapp, FaTrash, FaSave, FaPlus, FaImage, FaTimes, FaRobot, FaCopy } from 'react-icons/fa';

const WhatsAppMessage = ({ customer }) => {
    const [copied, setCopied] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const [mediaUrl, setMediaUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const [showDealerSelection, setShowDealerSelection] = useState(false);
    const [showContactCard, setShowContactCard] = useState(false);

    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [contactSearchTerm, setContactSearchTerm] = useState('');
    const [contactTypeFilter, setContactTypeFilter] = useState('all');
    const [showAPIIntegration, setShowAPIIntegration] = useState(false);

    const [sending, setSending] = useState(false);
    const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0, current: '' });
    const [sendResults, setSendResults] = useState([]);

    // Fetch templates from database
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

    // Load contacts
    useEffect(() => {
        loadAllContacts();
    }, []);

    const loadAllContacts = async () => {
        setLoadingContacts(true);
        try {
            const categories = ['dealers', 'customers', 'agents', 'bankers', 'employees'];
            let combinedContacts = [];

            for (const category of categories) {
                const categoryRef = ref(database, category);
                const snapshot = await get(categoryRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    Object.entries(data).forEach(([id, contact]) => {
                        combinedContacts.push({
                            id,
                            name: contact.name || contact.dealerName || contact.bankName || 'Unknown',
                            mobile: contact.mobile || contact.mobile1 || contact.phone || '',
                            category: category.charAt(0).toUpperCase() + category.slice(1),
                            businessName: contact.businessName || contact.companyName || '',
                            icon: getCategoryIcon(category)
                        });
                    });
                }
            }
            setAllContacts(combinedContacts);
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setLoadingContacts(false);
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'dealers': return '🏬';
            case 'customers': return '👤';
            case 'agents': return '🤝';
            case 'bankers': return '🏦';
            case 'employees': return '👔';
            default: return '📱';
        }
    };

    const getFilteredContacts = () => {
        return allContacts.filter(contact => {
            const matchesSearch = contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                contact.mobile.includes(contactSearchTerm);
            const matchesType = contactTypeFilter === 'all' || contact.category === contactTypeFilter;
            return matchesSearch && matchesType;
        });
    };

    const handleContactToggle = (contactId) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleSelectAllContacts = () => {
        const filtered = getFilteredContacts();
        if (selectedContacts.length === filtered.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filtered.map(c => c.id));
        }
    };

    // Replace placeholders in message
    const getFinalMessage = () => {
        if (!customMessage) return '';

        let msg = customMessage;
        const replacements = {
            '{name}': customer?.name || '',
            '{mobile}': customer?.mobile1 || '',
            '{city}': customer?.city || customer?.customer_details?.basic_info?.city_village || '',
            '{loanType}': customer?.loanType || '',
            '{loanAmount}': customer?.loan_application?.loan_details?.loan_amount || '',
            '{date}': new Date().toLocaleDateString('en-IN')
        };

        Object.entries(replacements).forEach(([key, value]) => {
            const regex = new RegExp(key, 'g');
            msg = msg.replace(regex, value);
        });

        return msg;
    };

    const message = getFinalMessage();

    // Template handling
    const handleSaveTemplate = async () => {
        if (!newTemplateName.trim()) {
            alert('Please enter a template name');
            return;
        }

        setIsSavingTemplate(true);
        try {
            const templatesRef = ref(database, 'whatsapp_templates');
            await push(templatesRef, {
                name: newTemplateName,
                content: customMessage,
                mediaUrl: mediaUrl || null,
                createdAt: new Date().toISOString()
            });
            setNewTemplateName('');
            setShowSaveDialog(false);
            alert('Template saved successfully!');
        } catch (error) {
            alert('Error saving template: ' + error.message);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await remove(ref(database, `whatsapp_templates/${templateId}`));
            if (selectedTemplateId === templateId) {
                setSelectedTemplateId('');
                setCustomMessage('');
                setMediaUrl('');
            }
        } catch (error) {
            alert('Error deleting template');
        }
    };

    const handleTemplateSelect = (e) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);
        if (templateId === '') {
            setCustomMessage('');
            setMediaUrl('');
            return;
        }
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setCustomMessage(template.content);
            setMediaUrl(template.mediaUrl || '');
        }
    };

    // Image handling (without saving to cloud)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Increase limit to 10MB for better compatibility with modern phones
        if (file.size > 10 * 1024 * 1024) {
            alert('Image is too large. Please select an image under 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadstart = () => {
            setUploadingImage(true);
            setUploadProgress(50);
        };
        
        reader.onload = (event) => {
            console.log('File read successfully');
            setMediaUrl(event.target.result); // This is the Base64 Data URL
            setUploadingImage(false);
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 1000);
        };

        reader.onerror = (error) => {
            console.error('FileReader Error:', error);
            alert('Failed to read file');
            setUploadingImage(false);
        };

        reader.readAsDataURL(file);
        
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text');
        }
    };

    const handleDirectSend = async () => {
        if (selectedContacts.length === 0) {
            alert('Please select at least one contact');
            return;
        }

        setSending(true);
        setShowAPIIntegration(true);
    };

    const getSelectedContactsData = () => {
        return allContacts.filter(c => selectedContacts.includes(c.id));
    };

    return (
        <div className="mt-6 p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaWhatsapp className="text-green-500" /> WhatsApp Actions
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Editor */}
                <div className="space-y-6">
                    {/* Template Controls */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Template</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedTemplateId}
                                onChange={handleTemplateSelect}
                                className="flex-1 px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none transition-all text-sm font-medium"
                            >
                                <option value="">Select a template...</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {selectedTemplateId && (
                                <button
                                    onClick={() => handleDeleteTemplate(selectedTemplateId)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Template"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Message Editor */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-gray-700">Message Content</label>
                            <div className="flex gap-2 text-[10px] text-gray-400">
                                <span>{'{name}'}</span>
                                <span>{'{loanType}'}</span>
                                <span>{'{loanAmount}'}</span>
                            </div>
                        </div>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Type your message here... Use {name} for dynamic name."
                            className="w-full h-48 px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none transition-all resize-none text-sm font-sans"
                        />
                    </div>

                    {/* Image Controls */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Image Attachment</label>
                        <div className="flex flex-col gap-3">
                            {/* File Upload */}
                            <div className="flex items-center gap-3">
                                <label
                                    htmlFor="whatsapp-image-upload"
                                    className={`px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 flex items-center gap-2 cursor-pointer transition-all ${uploadingImage ? 'opacity-50' : ''}`}
                                >
                                    <FaImage /> {uploadingImage ? `Processing...` : 'Upload File'}
                                </label>
                                <input
                                    id="whatsapp-image-upload"
                                    type="file"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <span className="text-xs text-gray-400 font-medium">OR</span>
                                <input
                                    type="text"
                                    placeholder="Paste Image URL here..."
                                    value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                    className="flex-1 px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none transition-all text-sm"
                                />
                            </div>

                            {mediaUrl && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-100 w-fit">
                                    <span className="truncate max-w-[200px]">
                                        {mediaUrl.startsWith('data:') ? 'Local Image Attached ✓' : 'Link Image Attached ✓'}
                                    </span>
                                    <button onClick={() => setMediaUrl('')} className="text-red-500 hover:text-red-700 ml-2">
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                        </div>
                        {mediaUrl && (
                            <div className="mt-2 relative group w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-100">
                                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => setMediaUrl('')} className="text-white bg-red-500 p-2 rounded-full shadow-lg">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Editor Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSaveDialog(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all border border-blue-100"
                        >
                            <FaSave /> Save Template
                        </button>
                    </div>
                </div>

                {/* Right Side: Preview & Sending */}
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-3xl p-6 border-2 border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-700 uppercase tracking-wider text-xs">Final Message Preview</h4>
                            <button
                                onClick={handleCopy}
                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1"
                            >
                                <FaCopy /> {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <div className="bg-[#EFEAE2] rounded-2xl p-4 shadow-inner min-h-[300px] border border-gray-200 flex flex-col items-end" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: 'cover' }}>
                            {message || mediaUrl ? (
                                <div className="bg-[#dcf8c6] p-2 rounded-xl shadow max-w-[85%] relative mt-2" style={{ borderTopRightRadius: 0 }}>
                                    <div className="absolute top-0 -right-2 w-0 h-0 border-t-[12px] border-t-[#dcf8c6] border-r-[12px] border-r-transparent"></div>
                                    
                                    {mediaUrl && (
                                        <div className="mb-1 rounded-lg overflow-hidden">
                                            <img src={mediaUrl} alt="Attached Media" className="w-full max-h-64 object-cover" />
                                        </div>
                                    )}
                                    {message && (
                                        <div className="text-[15px] whitespace-pre-wrap font-sans text-gray-800 px-1 pb-3">
                                            {message}
                                        </div>
                                    )}
                                    <div className="text-[11px] text-gray-500 text-right mt-[-12px] px-1 flex justify-end items-center gap-1 relative z-10">
                                        {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        <span className="text-blue-500 text-[14px] leading-none">✓✓</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/90 px-4 py-2 rounded-lg self-center mt-24 text-sm text-gray-500 shadow-sm text-center">
                                    Type a message or attach an image to see preview...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Selection Button */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setShowDealerSelection(!showDealerSelection)}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            <span className="text-xl">👥</span>
                            <span>Select Contacts ({selectedContacts.length} selected)</span>
                        </button>

                        {selectedContacts.length > 0 && (
                            <button
                                onClick={handleDirectSend}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                <FaRobot className="text-xl" />
                                <span>Send Automated ({selectedContacts.length})</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Selection Modal */}
            {showDealerSelection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDealerSelection(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h4 className="text-xl font-bold text-gray-800">Select Recipients</h4>
                            <button onClick={() => setShowDealerSelection(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                            <div className="flex gap-3">
                                <select
                                    value={contactTypeFilter}
                                    onChange={(e) => setContactTypeFilter(e.target.value)}
                                    className="px-4 py-2 border rounded-xl outline-none focus:border-purple-500"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="Customers">Customers</option>
                                    <option value="Agents">Agents</option>
                                    <option value="Bankers">Bankers</option>
                                    <option value="Dealers">Dealers</option>
                                    <option value="Employees">Employees</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search name or mobile..."
                                    value={contactSearchTerm}
                                    onChange={(e) => setContactSearchTerm(e.target.value)}
                                    className="flex-1 px-4 py-2 border rounded-xl outline-none focus:border-purple-500"
                                />
                            </div>

                            <button
                                onClick={handleSelectAllContacts}
                                className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                            >
                                {selectedContacts.length === getFilteredContacts().length ? 'Deselect All' : 'Select All Filtered'}
                            </button>

                            <div className="space-y-2">
                                {getFilteredContacts().map(contact => (
                                    <div
                                        key={contact.id}
                                        onClick={() => handleContactToggle(contact.id)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedContacts.includes(contact.id)
                                            ? 'bg-purple-50 border-purple-200'
                                            : 'bg-white border-gray-100 hover:border-purple-100'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gray-100`}>
                                            {contact.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-gray-800">{contact.name}</h5>
                                            <p className="text-sm text-gray-500">{contact.mobile} • {contact.category}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedContacts.includes(contact.id) ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                                            {selectedContacts.includes(contact.id) && <FaSave className="text-white text-xs" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowDealerSelection(false)}
                                className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg"
                            >
                                Done ({selectedContacts.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Template Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveDialog(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                        <h4 className="text-2xl font-bold text-gray-800 mb-6">Save Template</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Template Name</label>
                                <input
                                    type="text"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder="e.g. Welcome Message"
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSaveDialog(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTemplate}
                                    disabled={isSavingTemplate}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg"
                                >
                                    {isSavingTemplate ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* API Integration Modal */}
            {showAPIIntegration && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAPIIntegration(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex items-center justify-between bg-green-50">
                            <h4 className="text-xl font-bold text-green-800 flex items-center gap-2">
                                <FaRobot /> Automated WhatsApp Sending
                            </h4>
                            <button onClick={() => setShowAPIIntegration(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <WhatsAppAPIIntegration
                            message={message}
                            mediaUrl={mediaUrl}
                            selectedContacts={getSelectedContactsData()}
                            onSendComplete={() => {
                                // Optional: logic after sending
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppMessage;
