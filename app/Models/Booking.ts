import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasMany,
  HasMany,
  belongsTo,
  BelongsTo,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import UsersJoinBooking from 'App/Models/UsersJoinBooking'
import User from 'App/Models/User'
import Field from 'App/Models/Field'

/**
 * @swagger
 * components:
 *   schemas:
 *      Booking:
 *        type: object
 *        properties:
 *          play_start_time:
 *            type: date
 *          play_end_time:
 *            type: date
 *          users_id:
 *            type: number
 *          venues_id:
 *            type: number
 */
export default class Booking extends BaseModel {
  @hasMany(() => UsersJoinBooking)
  public UsersJoinBookings: HasMany<typeof UsersJoinBooking>

  @manyToMany(() => User, {
    localKey: 'id',
    pivotForeignKey: 'bookings_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'users_id',
    pivotTable: 'users_join_bookings',
  })
  public users_joined: ManyToMany<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'users_id',
  })
  public user_created: BelongsTo<typeof User>

  @belongsTo(() => Field, {
    foreignKey: 'fields_id',
  })
  public field: BelongsTo<typeof Field>

  @column({ isPrimary: true })
  public id: number

  @column()
  public playStartTime: DateTime

  @column()
  public playEndTime: DateTime

  @column()
  public users_id: number

  @column()
  public fields_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
