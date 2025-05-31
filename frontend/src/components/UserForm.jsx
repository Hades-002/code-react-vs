import React from 'react';

function UserForm({ form, setForm, handleSubmit }) {
    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <button type="submit">Add User</button>
        </form>
    );
}

export default UserForm;
