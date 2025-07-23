import { getDB } from './db';
import type { AIChatMessageDTO } from '../lib/types';

const STORE_NAME = 'aimessages';

// Save AI chat messages to IndexedDB
export async function cacheMessages(_userId: number, messages: AIChatMessageDTO[]) {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const msg of messages) {
        await tx.store.put(msg);
    }
    await tx.done;
}

// Retrieve all cached AI chat messages for a userId, ordered oldest first
export async function getCachedMessages(userId: number): Promise<AIChatMessageDTO[]> {
    const db = await getDB();
    const messages: AIChatMessageDTO[] = [];
    let cursor = await db.transaction(STORE_NAME).store.index('userId').openCursor(userId, 'next');
    while (cursor) {
        messages.push(cursor.value);
        cursor = await cursor.continue();
    }
    return messages;
}

