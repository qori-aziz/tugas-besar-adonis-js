import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Fields extends BaseSchema {
  protected tableName = 'fields'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.enum('type', ['soccer', 'minisoccer', 'futsal', 'basketball', 'volleyball'])
      table.integer('venues_id').unsigned().references('venues.id').onDelete('CASCADE')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
