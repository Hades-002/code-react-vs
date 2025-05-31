import { useState, useEffect } from 'react';
import {
    fetchUsers,
    addUser,
    exportUsers,
    importUsers,
    clearUsers
} from '../services/userService';

export const useUsers = () => {
    const [form, setForm] = useState({ name: '', email: '' });
    const [users, setUsers] = useState([]);

    const loadUsers = async () => {
        const data = await fetchUsers();
        if (data) setUsers(data);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) {
            alert('Name and email are required');
            return;
        }
        const success = await addUser(form);
        if (success) {
            setForm({ name: '', email: '' });
            loadUsers();
        }
    };

    const handleExport = () => exportUsers();
    const handleImport = async (e) => {
        const success = await importUsers(e);
        if (success) loadUsers();
    };
    const handleClear = async () => {
        const success = await clearUsers();
        if (success) loadUsers();
    };

    return {
        form, users, setForm,
        handleSubmit, handleExport,
        handleImport, handleClear
    };
};
