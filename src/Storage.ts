import SQLite from 'react-native-sqlite-storage';
import { Message } from './Types';
// 语言设置功能保持不变
let language: string;
export function setLanguage(lang: string) {
  language = lang;
};
export function getLanguage() {
  return language;
};


interface SQLiteDatabase {
  transaction: (
    callback: (tx: SQLiteTransaction) => void,
    error?: (error: any) => void,
    success?: () => void
  ) => void;
}

interface SQLiteTransaction {
  executeSql: (
    sql: string,
    args?: any[],
    success?: (tx: SQLiteTransaction, result: ResultSet) => void,
    error?: (tx: SQLiteTransaction, error: any) => boolean | void
  ) => void;
}

const avatarMap = new Map<string, string>();
// 定义数据库和事务类型
type Database = SQLiteDatabase;
type Transaction = SQLiteTransaction;
type ResultSet = {
  insertId?: number;
  rows: {
    length: number;
    item: (index: number) => any;
  };
};

// 初始化数据库
const openDatabase = (): Promise<Database> => {
  return new Promise((resolve, reject) => {
    const db = SQLite.openDatabase(
      { name: 'Chatify.db', location: 'default' },
      () => {
        console.log('Database opened successfully');
        resolve(db);
      },
      (error: any) => {
        console.error('Failed to open database', error);
        reject(error);
      }
    );
  });
};

// 数据库实例
let db: Database;

// 数据库版本控制
const DATABASE_VERSION = 1;

// 初始化数据库表
const initDatabase = async (): Promise<boolean> => {
  if (!db) {
    db = await openDatabase();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      // 获取当前版本
      tx.executeSql(
        'PRAGMA user_version',
        [],
        async (_: any, result: ResultSet) => {
          const currentVersion = result.rows.length > 0 
            ? result.rows.item(0).user_version 
            : 0;
          console.log('Current database version:', currentVersion);
          if (currentVersion < DATABASE_VERSION) {
            try {
              await upgradeDatabase(tx, currentVersion);
              console.log('Database is up to date');
              resolve(true);
            } catch (error) {
              reject(error);
            }
          } else {
            resolve(true);
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

const upgradeDatabase = async (tx: Transaction, fromVersion: number): Promise<boolean> => {
  let toVersion = fromVersion
  try {
    console.log('Upgrading database from version', toVersion);
    
    if (toVersion < 1) {
      console.log('Creating tables...');

      tx.executeSql(`DROP TABLE IF EXISTS kv`);
      tx.executeSql(`DROP TABLE IF EXISTS messages`);
      tx.executeSql(`DROP TABLE IF EXISTS users`);
      tx.executeSql(`DROP TABLE IF EXISTS current_user`);
      
      // 顺序执行建表SQL
      tx.executeSql(`
          CREATE TABLE kv (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              key TEXT NOT NULL,
              value TEXT NOT NULL
          );
        `);

      tx.executeSql(`
          CREATE TABLE messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT NOT NULL,
              room_id TEXT NOT NULL,
              type INT NOT NULL,
              content TEXT NOT NULL,
              msg_id INT NOT NULL,
              uuid UNSIGNED INT NOT NULL,
              state INT NOT NULL,
              is_sender INT NOT NULL,
              quote UNSIGNED INT NOT NULL DEFAULT 0
          );
        `);

      tx.executeSql(`
          CREATE TABLE users (
              id TEXT PRIMARY KEY,
              username TEXT NOT NULL,
              avatar TEXT,
              created_at INTEGER NOT NULL
          );
        `);

      tx.executeSql(`
          CREATE TABLE current_user (
              id TEXT PRIMARY KEY,
              username TEXT NOT NULL,
              avatar TEXT,
              last_login INTEGER NOT NULL
          );
        `);

      tx.executeSql(`CREATE UNIQUE INDEX 'uniq_rum' ON messages (room_id, username, msg_id);`);
      tx.executeSql(`CREATE INDEX 'idx_ru' ON messages (room_id, uuid);`);
      tx.executeSql(`CREATE UNIQUE INDEX 'idx_k' ON kv (key);`);
      tx.executeSql(`CREATE UNIQUE INDEX 'idx_username' ON users (username);`);

      console.log('Tables created successfully');
      toVersion += 1;
    }
    
    // if (toVersion < 2) {
    //   toVersion += 1;
    // }
    
    // 未来版本升级逻辑可以在这里添加
    if (toVersion !== fromVersion) {
      tx.executeSql(`PRAGMA user_version = ${toVersion}`);
      console.log('Database upgraded to version', toVersion);
    }
    return true;
  } catch (error) {
    console.error('Database upgrade failed:', error);
    return false;
  }
};


const SELECT_STRING = `
    SELECT username as senderId, room_id as roomId, type, content, msg_id as msgId, uuid, state, is_sender as isSender, quote
    FROM messages
`

export async function getValue(key: string): Promise<string | null> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `SELECT value FROM kv WHERE key = ?`,
        [key],
        (_: any, result: ResultSet) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve(row.value)
          } else {
            resolve(null)
          }
        },
        (_: any, error: any) => {
          console.log("Failed to update flag:", error);
          reject(error);
        }
      );
    });
  });
}

export async function setValue(key: string, value: string) {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(`INSERT OR REPLACE INTO kv (key, value) VALUES(?, ?)`, [key, value])
    });
  });
}

export async function saveMessages(messages: Message[]) {
  return Promise.all(messages.map(msg => {
    saveMessage(msg)
  }))
}

export async function recallMessgae(uuid: number): Promise<boolean> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `UPDATE messages SET state = 3 WHERE uuid = ?`,
        [uuid],
        (_: any, result: ResultSet) => {
          resolve(true)
        },
        (_: any, error: any) => {
          console.log("Failed to update flag:", error);
          reject(error);
        }
      );
    });
  });
}

export async function getMessageByUUID(uuid: number): Promise<Message | null> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `${SELECT_STRING} WHERE uuid = ?`,
        [uuid],
        (_: any, result: ResultSet) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({...row, content: JSON.parse(row.content as string)})
          } else {
            resolve(null)
          }
        },
        (_: any, error: any) => {
          console.log("Failed to update flag:", error);
          reject(error);
        }
      );
    });
  });
}

export async function delMessgae(uuid: number): Promise<boolean> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `DELETE FROM messages WHERE uuid = ?`,
        [uuid],
        (_: any, result: ResultSet) => {
          resolve(true)
        },
        (_: any, error: any) => {
          console.log("Failed to update flag:", error);
          reject(error);
        }
      );
    });
  });
}

export async function saveMessage(message: Message): Promise<number> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `INSERT OR IGNORE INTO messages (username, room_id, type, content, msg_id, uuid, state, is_sender, quote)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT DO NOTHING`,
        [
          message.senderId,
          message.roomId,
          message.type as number,
          JSON.stringify(message.content),
          message.msgId,
          message.uuid,
          message.state as number,
          message.isSender ? 1 : 0,
          message.quote ? message.quote.uuid : 0
        ],
        (_: any, result: ResultSet) => {
          // let id = result.rows.item(0).id;
          resolve(result.insertId!)
        },
        (_: any, error: any) => {
          console.log('createCheckIn error: ', error)
          reject(error);
          return false;
        })
    });
  });
}


export async function failed(roomId: string, msgId: number) {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(`
        UPDATE messages
        SET state = 2
        WHERE room_id = ?
        AND msg_id = ?
        AND is_sender = 1
        `, [roomId, msgId])
    });
  });
}

export async function updateContent(roomId: string, uuid: number, content: { img: string; thumbnail: string; }) {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(`
        UPDATE messages
        SET content = ?
        WHERE room_id = ?
        AND uuid= ?
        `, [JSON.stringify(content), roomId, uuid])
    });
  });
}

export async function updateUUID(id: number, uuid: number) {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(`
        UPDATE messages
        SET uuid = ? , state = 1
        WHERE id = ?
        `, [uuid, id])
    });
  });
}

export async function getLastReceivedMessageUUID(roomId: string): Promise<number> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `
          SELECT uuid FROM messages
          WHERE room_id = ?
          AND is_sender = 0
          ORDER BY uuid DESC
          LIMIT 1
        `,
        [roomId],
        (_: any, result: ResultSet) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve(row.uuid)
          }
        },
        (_: any, error: any) => {
          console.log("Failed to update flag:", error);
          reject(error);
        }
      );
    });
  });
}

export async function getMessages(roomId: string, direction: "before" | "after", limit: number, uuid?: number): Promise<Message[]> {
  await initDatabase();
  let sql: string
  let params: any[]
  if (uuid && direction === "before") {
    sql = `
      ${SELECT_STRING}
      WHERE room_id = ?
      AND uuid < ?
      ORDER BY uuid DESC
      LIMIT ?
      `
    params = [roomId, uuid, limit]
  } else if (uuid && direction === "after") {
    sql = `
      ${SELECT_STRING}
      WHERE room_id = ?
      AND uuid > ?
      ORDER BY uuid
      LIMIT ?
      `
    params = [roomId, uuid, limit]
  } else {
    sql = `
      ${SELECT_STRING}
      WHERE room_id = ?
      ORDER BY uuid DESC
      LIMIT ?
      `
    params = [roomId, limit]
  }
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        sql,
        params,
        async (_: any, result: ResultSet) => {
          const rows: Message[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            const avatar = await getAvatar(row.senderId)
            rows.push({ ...row, content: JSON.parse(row.content), avatar: avatar, quote: await getMessageByUUID(row.quote) })
          }
          resolve(rows);
        },
        (_: any, error: any) => {
          console.log("Failed to get Images Messages:", error);
          reject(error);
        }
      );
    });
  })
}


export async function getImagesMessages(roomId: string): Promise<Message[]> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `
          WHERE room_id = ?
          AND type = 1
        `,
        [roomId],
        (_: any, result: ResultSet) => {
          const rows: Message[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            rows.push({
              ...row,
              content: JSON.parse(row.content as string)
            });
          }
          resolve(rows);
        },
        (_: any, error: any) => {
          console.log("Failed to get Images Messages:", error);
          reject(error);
        }
      );
    });
  });

}





export async function setAvatar(username: string, avatar: string): Promise<string> {
  // 简化版本：直接保存 avatar URL，不下载文件
  await setValue(`avatar_${username}`, avatar);
  avatarMap.set(username, avatar);
  return avatar;
}


export async function getAvatar(username: string): Promise<string> {
  if (avatarMap.has(username)) {
    return avatarMap.get(username)!
  }
  const avatar = await getValue(`avatar_${username}`)
  if (!avatar) {
    return ''
  }
  avatarMap.set(username, avatar)
  return avatar
}

export type User = {
  id: string;
  username: string;
  avatar?: string;
};

export async function saveUser(user: User): Promise<void> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO users (id, username, avatar, created_at) VALUES (?, ?, ?, ?)`,
        [user.id, user.username, user.avatar || null, Date.now()],
        () => resolve(),
        (_, error) => {
          console.error('Failed to save user:', error);
          reject(error);
          return false;
        }
      );
    });
  });
}

export async function getCurrentUser(): Promise<User | null> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `SELECT id, username, avatar FROM current_user LIMIT 1`,
        [],
        (_, result: ResultSet) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({
              id: row.id,
              username: row.username,
              avatar: row.avatar
            });
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Failed to get current user:', error);
          reject(error);
          return false;
        }
      );
    });
  });
}

export async function setCurrentUser(user: User): Promise<void> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO current_user (id, username, avatar, last_login) VALUES (?, ?, ?, ?)`,
        [user.id, user.username, user.avatar || null, Date.now()],
        () => resolve(),
        (_, error) => {
          console.error('Failed to set current user:', error);
          reject(error);
          return false;
        }
      );
    });
  });
}

export async function getAvailableUsers(): Promise<User[]> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `SELECT id, username, avatar FROM users ORDER BY created_at DESC`,
        [],
        (_, result: ResultSet) => {
          const users: User[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            users.push({
              id: row.id,
              username: row.username,
              avatar: row.avatar
            });
          }
          resolve(users);
        },
        (_, error) => {
          console.error('Failed to get available users:', error);
          reject(error);
          return false;
        }
      );
    });
  });
}

export async function clearCurrentUser(): Promise<void> {
  await initDatabase();
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `DELETE FROM current_user`,
        [],
        () => resolve(),
        (_, error) => {
          console.error('Failed to clear current user:', error);
          reject(error);
          return false;
        }
      );
    });
  });
}


