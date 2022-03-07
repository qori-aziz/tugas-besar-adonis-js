import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersJoinBookings extends BaseSchema {
  protected tableName = 'users_join_bookings'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('users_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('bookings_id').unsigned().references('bookings.id').onDelete('CASCADE')

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
