const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");

const databaseDir = path.join(__dirname, "..", "..", "database");
const databasePath = path.join(databaseDir, "app.sqlite");

let dbInstance = null;

const ensureDatabaseDir = () => {
    if (!fs.existsSync(databaseDir)) {
        fs.mkdirSync(databaseDir, { recursive: true });
    }
};

const openDatabase = () => {
    if (dbInstance) return dbInstance;

    ensureDatabaseDir();
    dbInstance = new sqlite3.Database(databasePath);
    return dbInstance;
};

const runAsync = (sql, params = []) => {
    const db = openDatabase();
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (error) {
            if (error) return reject(error);
            resolve(this);
        });
    });
};

const getAsync = (sql, params = []) => {
    const db = openDatabase();
    return new Promise((resolve, reject) => {
        db.get(sql, params, (error, row) => {
            if (error) return reject(error);
            resolve(row);
        });
    });
};

const allAsync = (sql, params = []) => {
    const db = openDatabase();
    return new Promise((resolve, reject) => {
        db.all(sql, params, (error, rows) => {
            if (error) return reject(error);
            resolve(rows);
        });
    });
};

const loadMigrations = () => {
    const migrationsDir = path.join(databaseDir, "migrations");
    ensureDatabaseDir();

    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
    }

    return fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith(".js"))
        .sort()
        .map((file) => {
            const fullPath = path.join(migrationsDir, file);
            const migration = require(fullPath);
            const name = migration.name || file;
            return { file, name, migration };
        });
};

const ensureSchemaTable = async () => {
    await runAsync(
        "CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TEXT NOT NULL)",
    );
};

const runMigrations = async () => {
    await ensureSchemaTable();

    const migrations = loadMigrations();

    const applied = await allAsync("SELECT name FROM schema_migrations");
    const appliedNames = new Set(applied.map((row) => row.name));

    const context = {
        db: openDatabase(),
        runAsync,
        getAsync,
        allAsync,
    };

    const executed = [];

    for (const { file, name, migration } of migrations) {
        if (appliedNames.has(name)) continue;

        await runAsync("BEGIN");
        try {
            if (typeof migration.up !== "function") {
                throw new Error(`Migration ${file} tidak punya fungsi up()`);
            }

            await migration.up(context);
            await runAsync("INSERT INTO schema_migrations (name, applied_at) VALUES (?, datetime('now'))", [name]);
            await runAsync("COMMIT");
            executed.push(name);
        } catch (error) {
            await runAsync("ROLLBACK");
            throw error;
        }
    }

    return executed;
};

const rollbackLastMigration = async () => {
    await ensureSchemaTable();

    const last = await getAsync("SELECT id, name FROM schema_migrations ORDER BY id DESC LIMIT 1");

    if (!last) return null;

    const migrations = loadMigrations();
    const current = migrations.find((item) => item.name === last.name);

    if (!current) {
        throw new Error(`Migration ${last.name} tidak ditemukan di folder migrations`);
    }

    if (typeof current.migration.down !== "function") {
        throw new Error(`Migration ${current.file} tidak punya fungsi down()`);
    }

    await runAsync("BEGIN");
    try {
        await current.migration.down({ db: openDatabase(), runAsync, getAsync, allAsync });
        await runAsync("DELETE FROM schema_migrations WHERE id = ?", [last.id]);
        await runAsync("COMMIT");
        return current.name;
    } catch (error) {
        await runAsync("ROLLBACK");
        throw error;
    }
};

module.exports = {
    openDatabase,
    runAsync,
    getAsync,
    allAsync,
    runMigrations,
    rollbackLastMigration,
    databasePath,
};
