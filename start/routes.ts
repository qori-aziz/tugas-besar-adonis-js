/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('/login', 'AuthController.login').as('auth.login')
  Route.post('/register', 'AuthController.register').as('auth.register')
}).prefix('/api/v1')

Route.group(() => {
  Route.resource('venues', 'VenuesController')
  Route.resource('venues.fields', 'FieldsController')
  Route.resource('fields.bookings', 'BookingsController')
  Route.put('bookings/:id/join', 'BookingsController.join')
  Route.put('bookings/:id/unjoin', 'BookingsController.unjoin')
  Route.get('bookings/:id', 'BookingsController.findBookingsById')
  Route.delete('bookings/:id', 'BookingsController.unbook')
  Route.get('schedules', 'BookingsController.findCurrentUserSchedule')
})
  .prefix('/api/v1')
  .middleware('auth')
