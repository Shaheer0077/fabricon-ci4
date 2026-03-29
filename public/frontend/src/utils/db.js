/**
 * db.js — IndexedDB wrapper for Fabricon design persistence.
 *
 * Replaces localStorage (5 MB limit) with IndexedDB, which supports
 * several GBs of data — critical when designs contain large logo uploads
 * or many high-resolution snapshots.
 */

const DB_NAME = 'fabricon_db';
const DB_VERSION = 1;
const STORE_NAME = 'designs';

/**
 * Opens (or creates) the IndexedDB database and returns the db instance.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Saves design state to IndexedDB under the given id.
 * @param {string} id   - Unique key (e.g. product ID).
 * @param {object} data - Design state object to persist.
 * @returns {Promise<void>}
 */
export async function saveDesign(id, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put({ id, ...data });
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Retrieves design state from IndexedDB by id.
 * Returns null when no record exists for that id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getDesign(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = (event) => {
            const result = event.target.result;
            if (!result) return resolve(null);
            // Strip the 'id' key path field before returning
            const { id: _id, ...designData } = result;
            resolve(designData);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Deletes design state from IndexedDB by id.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteDesign(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}
