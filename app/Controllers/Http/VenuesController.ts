import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Venue from 'App/Models/Venue'

export default class VenuesController {
  //Get all venues
  /**
   * @swagger
   * /api/v1/venues:
   *  get:
   *     tags:
   *       - Venues
   *     summary: Get all venues
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
  public async index({ response }: HttpContextContract) {
    const venues = await Venue.query().preload('fields') //Using ORM
    response.status(200).json({ message: 'success get venues', venues })
  }

  //Create venues : Only owners
  /**
   * @swagger
   * /api/v1/venues:
   *  post:
   *     tags:
   *       - Venues
   *     summary: Create venues; Only owners can create venues
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *     - name : name
   *       in : query
   *       type : string
   *       example : GOR Mantap abiz
   *       required : true
   *       description : Venue's name
   *     - name : phone
   *       type : string
   *       in : query
   *       example : 082123124124
   *       required : true
   *       description : Phone number
   *     - name : address
   *       type : string
   *       in : query
   *       example : Jl Sekeloa no 1
   *       required : true
   *       description : Venue's address
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *       422:
   *         description: Failed
   */
  public async store({ auth, bouncer, request, response }: HttpContextContract) {
    let user = await auth.user
    await bouncer.authorize('ownerAuthorization')
    let userid = 0
    if (user !== undefined) {
      userid = user.id
    }
    const newVenueSchema = schema.create({
      name: schema.string({ trim: true }),
      phone: schema.string({ trim: true }, [rules.mobile()]),
      address: schema.string({ trim: true }),
    })
    const payload = await request.validate({ schema: newVenueSchema })
    const venues = await Venue.create({
      name: payload.name,
      phone: payload.phone,
      address: payload.address,
      users_id: userid,
    }) //Using ORM
    response.status(200).json({ message: 'success create venues', venues })
  }

  //Update venues : Specific to owner of that venues
  /**
   * @swagger
   * /api/v1/venues/{id}:
   *  put:
   *     tags:
   *       - Venues
   *     summary: Update venues; Specific to owner of that venues can update
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *     - name : id
   *       in : path
   *       type : number
   *       example : 1
   *       required : true
   *     - name : name
   *       in : query
   *       type : string
   *       example : GOR Mantap abiz
   *       required : false
   *       description : Venue's name
   *     - name : phone
   *       type : string
   *       in : query
   *       example : 082123124124
   *       required : false
   *       description : Phone number
   *     - name : address
   *       type : string
   *       in : query
   *       example : Jl Sekeloa no 1
   *       required : false
   *       description : Venue's address
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
    let venue = await Venue.findOrFail(request.param('id'))
    await bouncer.authorize('ownerVenues', venue)
    const newVenueSchema = schema.create({
      name: schema.string.optional({ trim: true }),
      phone: schema.string.optional({ trim: true }, [rules.mobile()]),
      address: schema.string.optional({ trim: true }),
    })
    const payload = await request.validate({ schema: newVenueSchema })

    if (payload.name !== undefined) {
      venue.name = payload.name
    }
    if (payload.phone !== undefined) {
      venue.phone = payload.phone
    }
    if (payload.address !== undefined) {
      venue.address = payload.address
    }
    await venue.save()
    return response.status(200).json({ message: 'success update venue', venue })
  }
  /**
   * @swagger
   * /api/v1/venues/{id}:
   *  delete:
   *     tags:
   *       - Venues
   *     summary: Delete venues; Specific to owner of that venues can delete
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *     - name : id
   *       in : path
   *       type : number
   *       example : 1
   *       required : true
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *       422:
   *         description: Failed
   */
  public async destroy({ bouncer, request, response }: HttpContextContract) {
    const venue = await Venue.findOrFail(request.param('id'))
    await bouncer.authorize('ownerAuthorization')
    await bouncer.authorize('ownerVenues', venue)
    await venue.delete()
    response.status(200).json({ message: `success delete venue on id : ${request.param('id')}` })
  }
}
