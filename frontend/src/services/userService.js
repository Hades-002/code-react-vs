import axios from 'axios';
import FileSaver from 'file-saver';

export const fetchUsers = async () => {
    try {
        const res = await axios.get('/user');
        return res.data.users;
    } catch (err) {
        console.error('Fetch error:', err);
    }
};

export const addUser = async (form) => {
    try {
        await axios.post('/user', form);
        return true;
    } catch (err) {
        if (err.response?.status === 409) {
            alert('User already exists!');
        } else {
            console.error('Submit error:', err);
        }
        return false;
    }
};

export const exportUsers = async () => {
    try {
        const response = await axios.get('/export-users', { responseType: 'blob' });
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        FileSaver.saveAs(blob, 'users.xlsx');
    } catch (err) {
        console.error('Export failed', err);
    }
};

export const importUsers = async (e) => {
    const file = e.target.files[0];
    if (!file) return false;

    const formData = new FormData();
    formData.append('file', file);

    try {
        await axios.post('/import-users', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Import successful!');
        return true;
    } catch (err) {
        console.error('Import failed', err);
        alert('Import failed!');
        return false;
    }
};

export const clearUsers = async () => {
    if (window.confirm('Are you sure you want to clear all users?')) {
        try {
            await axios.delete('/clear-users');
            alert('All users cleared!');
            return true;
        } catch (err) {
            console.error('Clear failed', err);
            alert('Failed to clear users');
        }
    }
    return false;
};
