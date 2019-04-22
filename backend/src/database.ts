import * as sequelize from 'sequelize';
import { logger } from './logger';
import { hasColumn, addColumn } from './lib/database-functions';

interface UpdateItem {
  'version': number;
  reason: string;
  update: (sql: sequelize.Sequelize) => void
}

interface UserAttributes {
  id?: string;
  username: string;
  password: string;
}

interface ItemAttributes {
  id?: string;
  text: string;
  position: number;
}

// These should maybe be defined somewhere else
export type UserInstance = sequelize.Instance<UserAttributes> & UserAttributes;
export type ItemInstance = sequelize.Instance<ItemAttributes> & ItemAttributes;
export type DBModel = sequelize.Model<any, any>;

export class Database {
  private sql: sequelize.Sequelize;
  private Item: sequelize.Model<any, any>;
  private User: sequelize.Model<any, any>;
  private Version: sequelize.Model<any, any>; // These should probably be moved to classes instead of variables.

  public constructor() {
    this.sql = new sequelize('rtlist', 'root', 'rootpassword', {
      host: process.env.ENVIRONMENT === 'docker' ? 'maria' : '127.0.0.1',
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
      archived: { type: sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      position: { type: sequelize.INTEGER, defaultValue: false, allowNull: true }
    });

    this.User = this.sql.define('user', {
      id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: sequelize.STRING, unique: true },
      email: { type: sequelize.STRING, unique: true },
      password: { type: sequelize.STRING }
    });

    await this.User.sync();
    await this.Item.sync();

    // Set up foreign key associations
    this.User.hasMany(this.Item, { foreignKey: 'added_by', sourceKey:'id'});
    this.User.hasMany(this.Item, { foreignKey: 'checked_by', sourceKey: 'id' });

    await this.User.sync();
    await this.Item.sync();

    this.Item.belongsTo(this.User, {foreignKey: 'added_by', targetKey: 'id', as: 'addedBy'});
    this.Item.belongsTo(this.User, {foreignKey: 'checked_by', targetKey: 'id', as: 'checkedBy'});

    await this.User.sync();
    await this.Item.sync();

    // Insert the admin user

    await this.User.findOrCreate({where: {'username': 'admin'}, defaults: {username: 'admin', email: 'admin@test.com', password: '$2a$10$0n9K6ep6htwbZEKYCckVpOuh6rtjC8hMxZOZj6wHeydAUn2eIRdtW'}});
    await this.User.sync();

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
      logger.error('db error :(', e);
      process.exit();
    }
    // First sync the version table so we can use it
    this.Version = this.sql.define('version', {
      id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      versionId: { type: sequelize.INTEGER }
    });
    await this.Version.sync();
    await this.Version.upsert({ id: 1, versionId: 1 });

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

    updates.push({
      version: 3,
      reason: 'Adding ordering column to the item table to allow reordering of items',
      update: async (sql: sequelize.Sequelize) => {
        if (! await hasColumn(sql, 'items', 'position')) {
          addColumn(sql, 'items', 'position', 'INTEGER(4)')
        }
      }
    });

    logger.debug('Running sql updates');
    for (let update of updates) {
      if (update.version > currentVersion) {
        try {
          logger.info(update.reason);
          update.update(this.sql);
          currentVersion += 1;
          this.Version.insertOrUpdate({ versionId: currentVersion });
        } catch (e) {
          logger.error('Update exception: ' + e.getMessage());
          process.exit();
        }
      }
    }
    logger.debug('updates run. DB versions has been updated to ' + currentVersion);
  }
}
