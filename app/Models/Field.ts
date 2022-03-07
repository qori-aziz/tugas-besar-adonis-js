import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Booking from 'App/Models/Booking'

/**
 * @swagger
 * components:
 *   schemas:
 *      Field:
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          type:
 *            type: string
 *          venues_id:
 *            type: number
 */
export default class Field extends BaseModel {
  @hasMany(() => Booking, {
    foreignKey: 'fields_id',
  })
  public Bookings: HasMany<typeof Booking>

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public type: string

  @column()
  public venues_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
