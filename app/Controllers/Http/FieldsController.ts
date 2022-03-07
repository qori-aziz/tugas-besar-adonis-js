import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Venue from 'App/Models/Venue'
import Field from 'App/Models/Field'

export default class FieldsController {
  /**
   * @swagger
   * /api/v1/venues/{venue_id}/fields:
   *  get:
   *     tags:
   *       - Venues_fields
   *     summary: Get all fields in a venue
   *     parameters:
   *     - name : venue_id
   *       in : path
   *       type : number
   *       example : 1
   *       required : true
   *     security:
   *     - bearerAuth: []
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *       422:
   *         description: Failed
   */
  public async index({ request, response }: HttpContextContract) {
    const fields = await Field.query().where('venues_id', request.param('venue_id')) //Using ORM
    response.status(200).json({ message: 'success get fields', fields })
  }
  //Create fields : Only owners
  /**
   * @swagger
   * /api/v1/venues/{venue_id}/fields:
   *  post:
   *     tags:
   *       - Venues_fields
   *     summary: Create a field; Only owner of a venue can create field
   *     parameters:
   *     - name : venue_id
   *       in : path
   *       type : number
   *       example : 1
   *       required : true
   *     - name : name
   *       in : query
   *       type : string
   *       example : Lapangan 1
   *       required : true
   *     - name : type
   *       in : query
   *       type : string
   *       description: enum, select from 'soccer', 'minisoccer', 'futsal', 'basketball', 'volleyball'
   *       example : soccer
   *       required : true
   *     security:
   *     - bearerAuth: []
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *       422:
   *         description: Failed
   */
  public async store({ bouncer, request, response }: HttpContextContract) {
    await bouncer.authorize('ownerAuthorization')
    const venue = await Venue.findOrFail(request.param('venue_id'))
    await bouncer.authorize('ownerVenues', venue)
    const newFieldSchema = schema.create({
      name: schema.string({ trim: true }),
      type: schema.enum(['soccer', 'minisoccer', 'futsal', 'basketball', 'volleyball']),
    })
    const payload = await request.validate({ schema: newFieldSchema })
    const field = await Field.create({
      name: payload.name,
      type: payload.type,
      venues_id: request.param('venue_id'),
    }) //Using ORM
    response.status(200).json({ message: 'success create field', field })
  }
  //Update field: Specific to owner of the venue which the field is belong to
  /**
   * @swagger
   * /api/v1/venues/{venue_id}/fields/{id}:
   *  put:
   *     tags:
   *       - Venues_fields
   *     summary: Update field; Specific to owner of the venue which the field is belong to can update field
   *     parameters:
   *     - name : venue_id
   *       in : path
   *       type : number
   *       example : 1
   *       required : true
   *     - name : id
   *       in : path
   *       type : number
   *       example : 1
   *       required : true
   *     - name : name
   *       in : query
   *       type : string
   *       example : Lapangan 1
   *       required : false
   *     - name : type
   *       in : query
   *       type : string
   *       description: enum, select from 'soccer', 'minisoccer', 'futsal', 'basketball', 'volleyball'
   *       example : soccer
   *       required : false
   *     security:
   *     - bearerAuth: []
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *       422:
   *         description: Failed
   */
  public async update({ bouncer, request, response }: HttpContextContract) {
    await bouncer.authorize('ownerAuthorization')
    let venue = await Venue.findOrFail(request.param('venue_id'))

    await bouncer.authorize('ownerVenues', venue)
    let field = await Field.findOrFail(request.param('id'))
    const newFieldSchema = schema.create({
      name: schema.string.optional({ trim: true }),
      type: schema.enum.optional(['soccer', 'minisoccer', 'futsal', 'basketball', 'volleyball']),
    })
    const payload = await request.validate({ schema: newFieldSchema })

    if (payload.name !== undefined) {
      field.name = payload.name
    }
    if (payload.type !== undefined) {
      field.type = payload.type
    }
    await field.save()
    return response.status(200).json({ message: 'success update field', field })
  }
  /**
   * @swagger
   * /api/v1/venues/{venue_id}/fields/{id}:
   *  delete:
   *     tags:
   *       - Venues_fields
   *     summary: Delete field; Specific to owner of the venue which the field is belong to can delete field
   *     parameters:
   *     - name : venue_id
   *       in : path
   *       type : number
   *       example : 1
   *       required : true
   *     - name : id
   *       in : path
   *       type : number
   *       example : 1
   *       required : true
   *     security:
   *     - bearerAuth: []
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *       422:
   *         description: Failed
   */
  public async destroy({ bouncer, request, response }: HttpContextContract) {
    const venue = await Venue.findOrFail(request.param('venue_id'))
    await bouncer.authorize('ownerAuthorization')
    await bouncer.authorize('ownerVenues', venue)
    const field = await Field.findOrFail(request.param('id'))
    await field.delete()
    response.status(200).json({ message: `success delete field on id : ${request.param('id')}` })
  }
}
