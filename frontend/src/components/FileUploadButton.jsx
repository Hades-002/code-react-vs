import React from 'react';

function FileUploadButton({ onImport }) {
    return (
        <label style={{ marginLeft: '10px', border: '1px solid gray', padding: '4px', cursor: 'pointer' }}>
            Import from Excel
            <input
                type="file"
                accept=".xlsx"
                onChange={onImport}
                style={{ display: 'none' }}
            />
        </label>
    );
}

export default FileUploadButton;
