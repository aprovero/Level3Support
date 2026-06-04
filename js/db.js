/**
 * Level3Support - Local IndexedDB persistence layer (v5.5.5)
 * Simple, zero-dependency wrapper for drafts and compressed evidence storage.
 */
(function() {
    const DB_NAME = 'Level3SupportDB';
    const DB_VERSION = 2;
    const STORE_RECORDS = 'records';
    const STORE_EVIDENCE = 'evidence';

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_RECORDS)) {
                    db.createObjectStore(STORE_RECORDS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(STORE_EVIDENCE)) {
                    db.createObjectStore(STORE_EVIDENCE, { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    const L3DB = {
        async saveRecord(record) {
            const db = await openDB();
            record.updatedAt = new Date().toISOString();
            if (!record.createdAt) {
                record.createdAt = record.updatedAt;
            }
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_RECORDS, 'readwrite');
                const store = transaction.objectStore(STORE_RECORDS);
                const request = store.put(record);
                request.onsuccess = () => {
                    window.dispatchEvent(new CustomEvent('l3-db-updated'));
                    resolve(request.result);
                };
                request.onerror = (e) => reject(request.error);
            });
        },

        async getRecord(id) {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_RECORDS, 'readonly');
                const store = transaction.objectStore(STORE_RECORDS);
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },

        async deleteRecord(id) {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_RECORDS, 'readwrite');
                const store = transaction.objectStore(STORE_RECORDS);
                const request = store.delete(id);
                request.onsuccess = () => {
                    window.dispatchEvent(new CustomEvent('l3-db-updated'));
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        },

        async getAllRecords() {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_RECORDS, 'readonly');
                const store = transaction.objectStore(STORE_RECORDS);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },

        async saveEvidence(ev) {
            const db = await openDB();
            ev.updatedAt = new Date().toISOString();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_EVIDENCE, 'readwrite');
                const store = transaction.objectStore(STORE_EVIDENCE);
                const request = store.put(ev);
                request.onsuccess = () => resolve(request.result);
                request.onerror = (e) => reject(request.error);
            });
        },

        async getEvidence(id) {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_EVIDENCE, 'readonly');
                const store = transaction.objectStore(STORE_EVIDENCE);
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },

        async deleteEvidence(id) {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_EVIDENCE, 'readwrite');
                const store = transaction.objectStore(STORE_EVIDENCE);
                const request = store.delete(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
    };

    window.L3DB = L3DB;
})();
