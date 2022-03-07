import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

/**
 * @swagger
 * components:
 *   schemas:
 *      UsersJoinBooking:
 *        type: object
 *        properties:
 *          users_id:
 *            type: number
 *          bookings_id:
 *            type: number
 */
export default class UsersJoinBooking extends BaseModel {
  public static table = 'users_join_bookings'

  @column({ isPrimary: true })
  public id: number

  @column()
  public users_id: number

  @column()
  public bookings_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
