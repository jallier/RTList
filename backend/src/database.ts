import * as sequelize from 'sequelize';
import { logger } from './logger';

interface UpdateItem {
  'version': number;
  reason: string;
  update: Function
}

export class Database {
  private sql: sequelize.Sequelize;
  private Item: sequelize.Model<any, any>;
  private User: sequelize.Model<any, any>;
  private Version: sequelize.Model<any, any>; // These should probably be moved to classes instead of variables.

  public constructor() {
    this.sql = new sequelize('rtlist', 'root', 'rootpassword', {
      host: '127.0.0.1',
      dialect: 'mysql',
      operatorsAliases: false,
      logging: false
    });
  }

  public async run() {
    await this.runUpdates();
    await this.initialize();
  }

  private async initialize() {
    this.Item = this.sql.define('item', {
      id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      date: { type: sequelize.DATE, allowNull: true },
      uuid: { type: sequelize.STRING, unique: true },
      text: { type: sequelize.STRING },
      added_by: { type: sequelize.INTEGER, allowNull: false },
      checked: { type: sequelize.BOOLEAN },
      checked_by: { type: sequelize.INTEGER, allowNull: true },
      archived: { type: sequelize.BOOLEAN, defaultValue: false, allowNull: false }
    });

    this.User = this.sql.define('user', {
      id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: sequelize.STRING, unique: true },
      email: { type: sequelize.STRING, unique: true },
      password: { type: sequelize.STRING }
    });

    this.User.sync();
    this.Item.sync();

    // Set up foreign key associations
    this.User.hasMany(this.Item, { foreignKey: 'added_by' });
    this.User.hasMany(this.Item, { foreignKey: 'checked_by' });

    this.User.sync();
    this.Item.sync();

    // Add some defaults to the db if they aren't there already
    this.User.upsert({ username: 'admin', email: 'admin@localhost.com', password: 'admin' });
    this.User.upsert({ username: 'test1', email: 'test@localhost.com', password: 'test1' });
    this.Item.upsert({ uuid: '1def48f0-3adb-11e8-b13e-35e3613a0a20', text: 'Sample item', added_by: 1, checked: false, checked_by: null });
    this.Item.upsert({ uuid: '1def48f0-3adb-11e8-b13e-35e3613a0a31', text: 'Sample item', added_by: 2, checked: true, checked_by: 1 });

    logger.info('DB succesfully initialized');
  }

  public getItemModel() {
    return this.Item;
  }

  public getUserModel() {
    return this.User;
  }

  public getSequelizeObject() {
    return this.sql;
  }

  private async runUpdates() {
    try {
      await this.sql.authenticate()
      logger.info('database succesfully authenticated');
    } catch (e) {
      logger.error('db error :(');
    }
    // First sync the version table so we can use it
    this.Version = this.sql.define('version', {
      id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      versionId: { type: sequelize.INTEGER }
    });
    this.Version.sync();
    this.Version.upsert({ id: 1, versionId: 1 });

    let updates: UpdateItem[] = [];
    let currentVersionResults = await this.sql.query('SELECT * FROM `versions` ORDER BY id DESC LIMIT 1', { type: sequelize.QueryTypes.SELECT });
    let currentVersion: number = currentVersionResults[0].versionId;

    updates.push({
      version: 2,
      reason: 'Adding columns for bulk delete',
      update: (sql: sequelize.Sequelize) => {
        sql.query('ALTER TABLE `items` ADD COLUMN archived BOOLEAN DEFAULT false NOT NULL', { type: sequelize.QueryTypes.RAW });
      }
    });

    logger.debug('Running sql updates');
    for (let update of updates) {
      if (update.version > currentVersion) {
        logger.info(update.reason);
        update.update(this.sql);
        currentVersion += 1;
        this.Version.insertOrUpdate({ versionId: currentVersion });
      }
    }
    logger.debug('updates run. DB versions has been updated to ' + currentVersion);
  }
}
