import * as sequelize from 'sequelize';
import { logger } from '../logger'

/**
 * Check if a given table has a column
 * @param sql Sequelize object
 * @param table Table to check
 * @param column Column to check
 */
export async function hasColumn(sql: sequelize.Sequelize, table: string, column: string) {
  let result = await sql.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`, { type: sequelize.QueryTypes.RAW });
  return result ? true : false;
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
  return await sql.query(`ALTER TABLE ${table} ADD COLUMN '${column}' ${definition}`)
}