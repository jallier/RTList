import * as sequelize from 'sequelize';
import { logger } from '../logger'
import { DBModel, ItemInstance } from '../database';

/**
 * Check if a given table has a column
 * @param sql Sequelize object
 * @param table Table to check
 * @param column Column to check
 */
export async function hasColumn(sql: sequelize.Sequelize, table: string, column: string) {
  if (!table || !column) {
    return false;
  }
  let tableDescription = await sql.getQueryInterface().describeTable(table);
  return column in tableDescription;
}

/**
 * Add a new column to a table. This will likely error if the column already exists
 * @param sql Sequelize Object
 * @param table The table to add the column to
 * @param column The column to add
 * @param definition The definition of the column eg INTEGER(4)
 */
export async function addColumn(sql: sequelize.Sequelize, table: string, column: string, definition: string) {
  if (!table || !column || !definition) {
    logger.error('Please provide the correct arguments for the function');
    throw new Error('Incorrect function arguments');
  }
  return await sql.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
}

/**
 * Returns the next position value after the current highest position i.e the new end of the list
 * @param Item The item sequelize model
 */
export async function getNewMaxPosition(Item: DBModel) {
  let max = await Item.max('position', { where: { archived: 0 } });
  return max + 100;
}

/**
 * Restore the correct ordering of the item positions
 * @param Item The item sequelize model
 */
export async function normalizeItemPositions(Item: DBModel) {
  let allItems: ItemInstance[] = await Item.findAll({ where: { archived: 0 }, order: [['checked', 'ASC'], ['position', 'ASC']] });
  let position = 0;
  for (const item of allItems) {
    item.position = position;
    await item.save();
    position += 100;
  }
}
