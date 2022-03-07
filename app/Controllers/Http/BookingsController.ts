import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Field from 'App/Models/Field'
import Booking from 'App/Models/Booking'
import UsersJoinBooking from 'App/Models/UsersJoinBooking'
import User from 'App/Models/User'

export default class BookingsController {
  /**
   * @swagger
   * /api/v1/fields/{field_id}/bookings:
   *  get:
   *     tags:
   *       - Fields
   *     summary: Get all bookings in designated fields
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *     - in : path
   *       name : field_id
   *       required : true
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *       422:
   *         description: Failed
   */
  public async index({ request, response }: HttpContextContract) {
    const bookings = await Booking.query()
      .where('fields_id', request.param('field_id'))
      .preload('field')
      .preload('user_created') //Using ORM
    response.status(200).json({ message: 'success get bookings', bookings })
  }
  //Create bookings : every user can create bookings
  /**
   * @swagger
   * /api/v1/fields/{field_id}/bookings:
   *  post:
   *     tags:
   *       - Fields
   *     summary: Create bookings in a designated field; every user can create bookings
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *     - in : path
   *       name : field_id
   *       example : 1
   *       required : true
   *     - name : play_start_time
   *       in : query
   *       type : date
   *       example : 2022-03-16 20:00
   *       required : true
   *       description : start playing time
   *     - name : play_end_time
   *       type : date
   *       in : query
   *       example : 2022-03-16 20:00
   *       required : true
   *       description : end playing time
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         example:
   *           message: 'register success'
   *       422:
   *         description: Failed
   */
  public async store({ auth, request, response }: HttpContextContract) {
    let user = await auth.user
    const field = await Field.findOrFail(request.param('field_id'))
    let userid = 0
    if (user !== undefined) {
      userid = user.id
    }
    const newBookingSchema = schema.create({
      play_start_time: schema.date({ format: 'yyyy-MM-dd HH:mm' }, [rules.after('today')]),
      play_end_time: schema.date({ format: 'yyyy-MM-dd HH:mm' }, [rules.after('today')]),
    })
    await request.validate({ schema: newBookingSchema })
    const booking = await Booking.create({
      playStartTime: request.input('play_start_time'),
      playEndTime: request.input('play_end_time'),
      users_id: userid,
      fields_id: field.id,
    }) //Using ORM
    response.status(200).json({ message: 'success create booking', booking })
  }
  //Update booking: Specific to user who make the booking
  /**
   * @swagger
   * /api/v1/fields/{field_id}/bookings/{id}:
   *  put:
   *     tags:
   *       - Fields
   *     summary: Update booking; Specific to user who make the booking
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *     - in : path
   *       name : field_id
   *       example : 1
   *       required : true
   *     - in : path
   *       name : id
   *       example : 1
   *       required : true
   *     - name : play_start_time
   *       in : query
   *       type : date
   *       example : 2022-03-16 20:00
   *       required : false
   *       description : start playing time
   *     - name : play_end_time
   *       type : date
   *       in : query
   *       example : 2022-03-16 20:00
   *       required : false
   *       description : end playing time
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         example:
   *           message: 'register success'
   *       422:
   *         description: Failed
   */
  public async update({ bouncer, request, response }: HttpContextContract) {
    let booking = await Booking.findOrFail(request.param('id'))
    if (booking.fields_id !== Number(request.param('field_id', 0))) {
      return response.status(404).json({ message: 'failed to find booking' })
    }
    await bouncer.authorize('bookedUser', booking)
    const newBookingSchema = schema.create({
      play_start_time: schema.date.optional({ format: 'yyyy-MM-dd HH:mm' }, [rules.after('today')]),
      play_end_time: schema.date.optional({ format: 'yyyy-MM-dd HH:mm' }, [rules.after('today')]),
    })
    await request.validate({ schema: newBookingSchema })

    if (request.input('play_start_time') !== undefined) {
      booking.playStartTime = request.input('play_start_time')
    }
    if (request.input('play_end_time') !== undefined) {
      booking.playEndTime = request.input('play_end_time')
    }
    await booking.save()
    return response.status(200).json({ message: 'success update booking', booking })
  }
  //Join a designated booking
  /**
   * @swagger
   * /api/v1/bookings/{id}/join:
   *  put:
   *     tags:
   *       - Bookings
   *     summary: Join a designated booking; the bookers cannot join his own
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *     - in : path
   *       name : id
   *       example : 1
   *       required : true
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         example:
   *           message: 'success'
   *       422:
   *         description: Failed
   */
  public async join({ auth, request, response }: HttpContextContract) {
    let user = await auth.user
    let booking = await Booking.findOrFail(request.param('id'))
    if (user === undefined) {
      return response.status(404).json({ message: 'failed to find current user' })
    }
    if (booking.users_id === Number(user.id)) {
      return response
        .status(404)
        .json({ message: 'failed to join booking : you are the one who created it' })
    }
    let userJoinBookings = await UsersJoinBooking.query()
      .where('bookings_id', request.param('id'))
      .where('users_id', user.id)
    if (userJoinBookings.length !== 0) {
      return response
        .status(404)
        .json({ message: 'failed to join booking : you have joined this booking' })
    }
    let userJoinBooking = await UsersJoinBooking.create({
      bookings_id: request.param('id'),
      users_id: user.id,
    })
    return response.status(200).json({ message: 'success joined booking', userJoinBooking })
  }
  //Unjoin a designated booking
  /**
   * @swagger
   * /api/v1/bookings/{id}/unjoin:
   *  put:
   *     tags:
   *       - Bookings
   *     summary: Unjoin a booking that have been joined
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *     - in : path
   *       name : id
   *       example : 1
   *       required : true
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         example:
   *           message: 'success'
   *       404:
   *         description: Failed
   */
  public async unjoin({ auth, request, response }: HttpContextContract) {
    let user = await auth.user
    let booking = await Booking.findOrFail(request.param('id'))
    if (user === undefined) {
      return response.status(404).json({ message: 'failed to find current user' })
    }
    if (booking.users_id === Number(user.id)) {
      return response
        .status(404)
        .json({ message: 'failed to unjoin booking : you are the one who created it' })
    }
    let userJoinBookings = await UsersJoinBooking.query()
      .where('bookings_id', request.param('id'))
      .where('users_id', user.id)
    if (userJoinBookings.length === 0) {
      return response
        .status(404)
        .json({ message: 'failed to unjoin booking : you are not joining this booking' })
    }
    const userJoinBooking = await UsersJoinBooking.findByOrFail('id', userJoinBookings[0].id)
    await userJoinBooking.delete()
    return response.status(200).json({ message: 'success unjoined booking' })
  }
  //Find booking by id, as well as users joined
  /**
   * @swagger
   * /api/v1/bookings/{id}:
   *  get:
   *     tags:
   *       - Bookings
   *     summary: Find booking by id, as well as users joined
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *     - in : path
   *       name : id
   *       example : 1
   *       required : true
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         example:
   *           message: 'success'
   *       404:
   *         description: Failed
   */
  public async findBookingsById({ auth, request, response }: HttpContextContract) {
    let user = await auth.user
    let booking = await Booking.query().where('id', request.param('id')).preload('users_joined')
    if (user === undefined) {
      return response.status(404).json({ message: 'failed to find current user' })
    }
    return response.status(200).json({ booking })
  }
  //Find current user schedule
  /**
   * @swagger
   * /api/v1/schedules:
   *  get:
   *     tags:
   *       - Bookings
   *     summary: Find bookings joined by current user
   *     security:
   *     - bearerAuth: []
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         example:
   *           message: 'success'
   *       404:
   *         description: Failed
   */
  public async findCurrentUserSchedule({ auth, response }: HttpContextContract) {
    let user = await auth.user
    if (user === undefined) {
      return response.status(404).json({ message: 'failed to find current user' })
    }
    let data = await User.query().where('id', user.id).preload('user_bookings')
    return response.status(200).json({ message: 'success get current user booking', data })
  }

  //Unbook a booking
  /**
   * @swagger
   * /api/v1/bookings/{id}:
   *  delete:
   *     tags:
   *       - Bookings
   *     summary: Unbook (delete) a booking. Only user who make the reservation can unbook
   *     security:
   *     - bearerAuth: []
   *     parameters:
   *     - in : path
   *       name : id
   *       example : 1
   *       required : true
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *         example:
   *           message: 'success'
   *       404:
   *         description: Failed
   */
  public async unbook({ bouncer, request, response, auth }: HttpContextContract) {
    let booking = await Booking.findOrFail(request.param('id'))
    await bouncer.authorize('bookedUser', booking)
    let user = auth.user
    if (user === undefined) {
      return response.status(404).json({ message: 'failed to find current user' })
    }
    await UsersJoinBooking.query().where('bookings_id', booking.id).delete()
    await booking.delete()
    return response.status(200).json({ message: 'success delete booking' })
  }
}
