import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Field from 'App/Models/Field'
import User from 'App/Models/User'

/**
 * @swagger
 * components:
 *   schemas:
 *      Venue:
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          phone:
 *            type: string
 *          address:
 *            type: phone
 *          users_id:
 *            type: number
 */
export default class Venue extends BaseModel {
  @hasMany(() => Field, {
    foreignKey: 'venues_id',
  })
  public fields: HasMany<typeof Field>

  @belongsTo(() => User, {
    foreignKey: 'users_id',
  })
  public user: BelongsTo<typeof User>

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public phone: string

  @column()
  public address: string

  @column()
  public users_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
