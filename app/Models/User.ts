import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeSave,
  column,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Booking from 'App/Models/Booking'
import Venue from 'App/Models/Venue'
import UsersJoinBooking from 'App/Models/UsersJoinBooking'
import Hash from '@ioc:Adonis/Core/Hash'
require('@phc/argon2')

/**
 * @swagger
 * components:
 *   schemas:
 *      User:
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          password:
 *            type: string
 *          password_confirmation:
 *            type: string
 *          role:
 *            type: string
 */
export default class User extends BaseModel {
  @hasMany(() => Venue, {
    foreignKey: 'users_id',
  })
  public Venues: HasMany<typeof Venue>

  @hasMany(() => Booking, {
    foreignKey: 'users_id',
  })
  public Bookings: HasMany<typeof Booking>

  @hasMany(() => UsersJoinBooking, {
    foreignKey: 'users_id',
  })
  public UsersJoinBookings: HasMany<typeof UsersJoinBooking>

  @manyToMany(() => Booking, {
    localKey: 'id',
    pivotForeignKey: 'users_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'bookings_id',
    pivotTable: 'users_join_bookings',
  })
  public user_bookings: ManyToMany<typeof Booking>

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public password: string

  @column()
  public rememberMeToken?: string

  @column()
  public role: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
