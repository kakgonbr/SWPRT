import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { ChatMessageDTO, AIChatMessageDTO } from '../lib/types';

const DB_NAME = 'chat-db';
const DB_VERSION = 2;

export interface ChatDBSchema extends DBSchema {
    messages: {
        key: number; // chatMessageId
        value: ChatMessageDTO;
        indexes: {
            'chatId': number;
            'chatId_sendTime': [number, string];
        };
    };
    aimessages: {
        key: number; // aiChatMessageId
        value: AIChatMessageDTO;
        indexes: {
            'userId': number;
        };
    };
}

export async function getDB() {
    return openDB<ChatDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Create 'messages' store if missing
            if (!db.objectStoreNames.contains('messages')) {
                const store = db.createObjectStore('messages', { keyPath: 'chatMessageId' });
                store.createIndex('chatId', 'chatId');
                store.createIndex('chatId_sendTime', ['chatId', 'sendTime']);
            }
            // Create 'aimessages' store if missing
            if (!db.objectStoreNames.contains('aimessages')) {
                const store = db.createObjectStore('aimessages', { keyPath: 'aiChatMessageId' });
                store.createIndex('userId', 'userId');
            }
        },
    });
} 