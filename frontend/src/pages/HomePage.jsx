import React from 'react';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import FileUploadButton from '../components/FileUploadButton';
import { useUsers } from '../hooks/useUsers';

function HomePage() {
    const {
        form,
        users,
        setForm,
        handleSubmit,
        handleExport,
        handleImport,
        handleClear,
    } = useUsers();

    return (
        <div>
            <h1>Users List</h1>
            <UserForm form={form} setForm={setForm} handleSubmit={handleSubmit} />
            <div style={{ marginTop: '20px' }}>
                <button onClick={handleExport}>Export to Excel</button>
                <button onClick={handleClear} style={{ marginLeft: '10px' }}>Clear All</button>
                <FileUploadButton onImport={handleImport} />
            </div>
            <UserList users={users} />
        </div>
    );
}

export default HomePage;
