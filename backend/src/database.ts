import * as sequelize from 'sequelize';
import { logger } from './logger';

export class Database {
  private sql: sequelize.Sequelize;
  private Item: sequelize.Model<any, any>;
  private User: sequelize.Model<any, any>;

  public constructor() {
    this.sql = new sequelize('rtlist', 'root', 'rootpassword', {
      host: '127.0.0.1',
      dialect: 'mysql',
      operatorsAliases: false,
      logging: false
    });
  }

  public async run() {
    await this.initialize();
  }

  private async initialize() {
    try {
      await this.sql.authenticate()
      logger.info('database succesfully authenticated');
    } catch (e) {
      logger.error('db error :(');
    }
    this.Item = this.sql.define('item', {
      id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      date: { type: sequelize.DATE, allowNull: true },
      uuid: { type: sequelize.STRING, unique: true },
      text: { type: sequelize.STRING },
      added_by: { type: sequelize.INTEGER, allowNull: false },
      checked: { type: sequelize.BOOLEAN },
      checked_by: { type: sequelize.INTEGER, allowNull: true }
    });

    this.User = this.sql.define('user', {
      id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: sequelize.STRING, unique: true },
      email: { type: sequelize.STRING, unique: true },
      password: { type: sequelize.STRING }
    });

    this.User.sync();
    this.Item.sync();

    this.User.hasMany(this.Item, { foreignKey: 'added_by' });
    this.User.hasMany(this.Item, { foreignKey: 'checked_by' });

    this.User.sync();
    this.Item.sync();

    // Add some defaults to the db if they aren't there already
    this.User.upsert({ username: 'admin', email: 'admin@localhost.com', password: 'admin' });
    this.User.upsert({ username: 'test1', email: 'test@localhost.com', password: 'test1' });
    this.Item.upsert({ uuid: '1def48f0-3adb-11e8-b13e-35e3613a0a20', text: 'Sample item', added_by: 1, checked: false, checked_by: null });
    this.Item.upsert({ uuid: '1def48f0-3adb-11e8-b13e-35e3613a0a31', text: 'Sample item', added_by: 2, checked: true, checked_by: 1 });
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
}
