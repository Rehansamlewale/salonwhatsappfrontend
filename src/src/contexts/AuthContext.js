import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, database } from '../firebase';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from 'firebase/auth';
import { ref, get, update } from 'firebase/database';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [token, setToken] = useState(() => {
        try { return localStorage.getItem('jwtToken') || null; } catch (e) { return null; }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Login function with DB fallback
    const login = async (email, password) => {
        try {
            setError(null);

            // Try Firebase Auth first
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await userCredential.user.getIdToken();
                setToken(idToken);
                localStorage.setItem('jwtToken', idToken);
                return userCredential.user;
            } catch (firebaseErr) {
                // If Firebase Auth fails, try Database Login (for employees)
                // Only fall back if the error is related to user not found or invalid credentials
                const canTryDb = firebaseErr.code === 'auth/user-not-found' ||
                    firebaseErr.code === 'auth/wrong-password' ||
                    firebaseErr.code === 'auth/invalid-credential' ||
                    firebaseErr.code === 'auth/invalid-email';

                if (!canTryDb || !database) throw firebaseErr;

                // Check Employees in Realtime DB
                try {
                    const employeesRef = ref(database, 'employees');
                    const snapshot = await get(employeesRef);

                    if (snapshot.exists()) {
                        const employeesData = snapshot.val();
                        for (const [empId, empData] of Object.entries(employeesData)) {
                            const dbEmail = empData.email ? empData.email.toLowerCase().trim() : '';
                            const inputEmail = email.toLowerCase().trim();

                            if (dbEmail === inputEmail) {
                                // Convert both to string to handle potential number/string mismatch
                                if (String(empData.password) === String(password)) {
                                    // Check if employee is active
                                    const isActive = empData.isActive !== undefined ? empData.isActive : true;
                                    if (!isActive) {
                                        throw new Error('Your account has been deactivated. Please contact the administrator.');
                                    }

                                    // Found matching employee! Create "fake" user session
                                    const fakeUser = {
                                        uid: empId,
                                        email: empData.email,
                                        displayName: empData.name,
                                        isDbUser: true
                                    };

                                    // Persist to local storage
                                    localStorage.setItem('dbUser', JSON.stringify(fakeUser));

                                    setCurrentUser(fakeUser);
                                    // Also set employee data immediately
                                    setEmployeeData({
                                        id: empId,
                                        name: empData.name || '',
                                        email: empData.email || '',
                                        mobile: empData.number?.toString() || '',
                                        role: empData.role ? empData.role.charAt(0).toUpperCase() + empData.role.slice(1) : 'Agent',
                                        permissions: empData.permissions || {},
                                        isActive: isActive
                                    });

                                    return fakeUser;
                                }
                            }
                        }
                    }
                } catch (dbErr) {
                    // If DB lookup fails (e.g. permission denied), just ignore and throw original auth error
                    console.error('DB fallback login failed:', dbErr);
                }

                // If we reach here, neither Auth nor DB login worked
                throw new Error('Invalid email or password');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Signup function (for future use)
    const signup = async (email, password) => {
        try {
            setError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Change Password function (Admin & Employee)
    const changePassword = async (oldPassword, newPassword) => {
        try {
            setError(null);

            if (currentUser.isDbUser) {
                // Database User (Employee)
                // Need to verify old password by fetching current data
                const userRef = ref(database, `employees/${currentUser.uid}`);
                const snapshot = await get(userRef);

                if (!snapshot.exists()) throw new Error('User record not found.');

                const currentData = snapshot.val();

                // Verify old password (with string coercion)
                if (String(currentData.password) !== String(oldPassword)) {
                    throw new Error('Incorrect current password.');
                }

                // Update to new password
                await update(userRef, { password: newPassword });
                return true;

            } else {
                // Firebase User (Admin)
                if (!auth.currentUser) throw new Error('No authenticated user.');

                const user = auth.currentUser;
                const credential = EmailAuthProvider.credential(user.email, oldPassword);

                // Re-authenticate
                await reauthenticateWithCredential(user, credential);

                // Update password
                await updatePassword(user, newPassword);
                return true;
            }
        } catch (err) {
            
            // Improve firebase error messages
            if (err.code === 'auth/wrong-password') {
                throw new Error('Incorrect current password.');
            }
            throw err;
        }
    };

    // Logout function
    const logout = useCallback(async () => {
        try {
            setError(null);

            // Clear state immediately (synchronous)
            setCurrentUser(null);
            setEmployeeData(null);
            setToken(null);

            // Clear localStorage
            try {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('dbUser'); // Clear DB session
            } catch (e) { /* ignore */ }

            // Then sign out from Firebase (async)
            await signOut(auth);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Fetch employee data from Realtime Database
    const fetchEmployeeData = useCallback(async (userEmail) => {
        try {
            if (!database) {
                
                return null;
            }

            const employeesRef = ref(database, 'employees');
            const snapshot = await get(employeesRef);

            if (!snapshot.exists()) {
                return null;
            }

            const employeesData = snapshot.val();

            // Find employee by email
            for (const [empId, empData] of Object.entries(employeesData)) {
                if (empData.email && empData.email.toLowerCase() === userEmail.toLowerCase()) {
                    return {
                        id: empId,
                        name: empData.name || '',
                        email: empData.email || '',
                        mobile: empData.number?.toString() || '',
                        role: empData.role ? empData.role.charAt(0).toUpperCase() + empData.role.slice(1) : 'Agent',
                        permissions: empData.permissions || {},
                        isActive: empData.isActive !== undefined ? empData.isActive : true
                    };
                }
            }

            return null;
        } catch (err) {
            
            return null;
        }
    }, []);



    // Listen for auth state changes and restore session
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Firebase Auth User
                setCurrentUser(user);

                if (user.email) {
                    try {
                        const idToken = await user.getIdToken();
                        setToken(idToken);
                        localStorage.setItem('jwtToken', idToken);
                    } catch (tokErr) {
                        
                    }
                    const empData = await fetchEmployeeData(user.email);
                    setEmployeeData(empData);
                } else {
                    setEmployeeData(null);
                }
            } else {
                // No Firebase Auth user - check for DB User session
                const dbUserStr = localStorage.getItem('dbUser');
                if (dbUserStr) {
                    try {
                        const dbUser = JSON.parse(dbUserStr);
                        const empData = await fetchEmployeeData(dbUser.email);

                        // Check if employee is still active
                        if (empData && empData.isActive === false) {
                            // Employee has been deactivated, log them out
                            
                            localStorage.removeItem('dbUser');
                            setCurrentUser(null);
                            setEmployeeData(null);
                        } else if (empData) {
                            setCurrentUser(dbUser);
                            setEmployeeData(empData);
                        } else {
                            // Employee data not found, clear session
                            localStorage.removeItem('dbUser');
                            setCurrentUser(null);
                            setEmployeeData(null);
                        }
                    } catch (e) {
                        
                        localStorage.removeItem('dbUser');
                        setCurrentUser(null);
                        setEmployeeData(null);
                    }
                } else {
                    setCurrentUser(null);
                    setEmployeeData(null);
                }
            }
            setLoading(false);
        });

        return unsubscribe;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    // Helper to make authenticated fetch requests including the JWT
    const authFetch = async (url, opts = {}) => {
        const headers = { ...(opts.headers || {}) };
        const tk = token || (await (auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)));
        if (tk) headers['Authorization'] = `Bearer ${tk}`;
        return fetch(url, { ...opts, headers });
    };

    const value = {
        currentUser,
        employeeData,
        token,
        login,
        signup,
        changePassword,
        logout,
        authFetch,
        loading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
