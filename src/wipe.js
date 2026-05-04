const fs = require('fs');
const content = fs.readFileSync('src/components/AdminDashboard.js', 'utf8');

const searchStr = '    return (\r\n        <div className="w-full max-w-none">';
let returnIndex = content.indexOf(searchStr);

if (returnIndex === -1) {
    // try just return (
    returnIndex = content.indexOf('return (', content.indexOf('if (loading)'));
}

if (returnIndex > -1) {
    const newContent = content.substring(0, returnIndex) + 
`    return (
        <div className="w-full max-w-none min-h-screen bg-gray-50 p-6 sm:p-8">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-2">New design coming soon...</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px] flex items-center justify-center">
                <p className="text-gray-400 text-lg">Dashboard Content Area</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
`;
    fs.writeFileSync('src/components/AdminDashboard.js', newContent);
    console.log('Wiped AdminDashboard.js');
} else {
    console.log('Could not find return block');
}
