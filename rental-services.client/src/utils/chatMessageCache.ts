import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { ChatMessageDTO } from '../lib/types';

const DB_NAME = 'chat-db';
const STORE_NAME = 'messages';

interface ChatDBSchema extends DBSchema {
    messages: {
        key: number; // chatMessageId
        value: ChatMessageDTO;
        indexes: {
            'chatId': number;
            'chatId_sendTime': [number, string];
        };
    };
}

async function getDB() {
    return openDB<ChatDBSchema>(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'chatMessageId' });
                store.createIndex('chatId', 'chatId');
                store.createIndex('chatId_sendTime', ['chatId', 'sendTime']);
            }
        },
    });
}

//save messages to IndexedD
export async function cacheMessages(_chatId: number, messages: ChatMessageDTO[]) {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const msg of messages) {
        await tx.store.put(msg);
    }
    await tx.done;
}

export async function getCachedMessages(chatId: number, limit = 5, before?: string): Promise<ChatMessageDTO[]> {
    const db = await getDB();
    let messages: ChatMessageDTO[] = [];
    // Use IDBKeyRange to filter messages by chatId and sendTime
    // If 'before' is provided, get all messages of chatId before that time (not included becasue we set open is true)
    //otherwise get all messages of chatId
    let keyRange = before ? IDBKeyRange.upperBound([chatId, before], true) : IDBKeyRange.bound([chatId, ''], [chatId, '\uffff']);
    let cursor = await db.transaction(STORE_NAME).store.index('chatId_sendTime').openCursor(keyRange, 'prev');
    while (cursor && messages.length < limit) {
        messages.push(cursor.value);
        cursor = await cursor.continue();
    }
    return messages.reverse(); // return the latest messages that are ordered by oldest first
}

export async function getLatestCachedMessage(chatId: number): Promise<ChatMessageDTO | undefined> {
    const db = await getDB();
    //get the latest messages of chatId
    let cursor = await db.transaction(STORE_NAME).store.index('chatId_sendTime').openCursor(IDBKeyRange.bound([chatId, ''], [chatId, '\uffff']), 'prev');
    return cursor?.value;
}

export async function getOldestCachedMessage(chatId: number): Promise<ChatMessageDTO | undefined> {
    const db = await getDB();
    //get the oldest messages of chatId
    let cursor = await db.transaction(STORE_NAME).store.index('chatId_sendTime').openCursor(IDBKeyRange.bound([chatId, ''], [chatId, '\uffff']));
    return cursor?.value;
}
