import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import Schema from '@ioc:Adonis/Lucid/Schema'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import RegisterValidator from 'App/Validators/RegisterValidator'

export default class AuthController {
  /**
   * @swagger
   * /api/v1/register:
   *  post:
   *     tags:
   *       - Auth
   *     summary: Register User
   *     parameters:
   *       - name: name
   *         description: name of user
   *         in: query
   *         type: string
   *         example: qori
   *         required: true
   *       - name: email
   *         description: email of user
   *         in: query
   *         type: string
   *         example: qori@mail.com
   *         required: true
   *       - name: password
   *         description: password of user. Will be hashed
   *         in: query
   *         type: string
   *         example: qoriaziz
   *         required: true
   *       - name: password_confirmation
   *         description: Same as password field for confirmation
   *         in: query
   *         type: string
   *         example: qoriaziz
   *         required: true
   *       - name: role
   *         description: role of user. Select from 'user' and 'owner'
   *         in: query
   *         type: string
   *         example: owner
   *         required: true
   *     requestBody:
   *         required: true
   *         content:
   *           application/x-www-form-urlencoded:
   *            schema:
   *             $ref: '#components/schemas/User'
   *           application/json:
   *            schema:
   *             $ref: '#components/schemas/User'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Register Success
   *         example:
   *           message: 'register success'
   *       422:
   *         description: Register Failed
   */
  public async register({ request, response }: HttpContextContract) {
    const payload = await request.validate(RegisterValidator)

    const newUser = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    })
    return response.status(200).json({ message: 'register success', data: newUser })
  }

  /**
   * @swagger
   * /api/v1/login:
   *  post:
   *     tags:
   *       - Auth
   *     summary: Login User
   *     parameters:
   *       - name: email
   *         description: email of user
   *         in: query
   *         type: string
   *         example: qori@mail.com
   *         required: true
   *       - name: password
   *         description: password of user.
   *         in: query
   *         type: string
   *         example: qoriaziz
   *         required: true
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login Success
   *         example:
   *           message: 'Login success'
   *       422:
   *         description: Login Failed
   */
  public async login({ auth, request, response }: HttpContextContract) {
    const newLoginSchema = schema.create({
      email: schema.string({ trim: true }),
      password: schema.string({ trim: true }),
    })
    const payload = await request.validate({ schema: newLoginSchema })
    const token = await auth.use('api').attempt(payload.email, payload.password, {
      expiresIn: '7days',
    })
    return response.status(200).json({ message: 'login success', data: token })
  }
}
