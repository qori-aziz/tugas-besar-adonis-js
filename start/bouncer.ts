/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from '@ioc:Adonis/Addons/Bouncer'
import Booking from 'App/Models/Booking'
import User from 'App/Models/User'
import Venue from 'App/Models/Venue'

/*
|--------------------------------------------------------------------------
| Bouncer Actions
|--------------------------------------------------------------------------
|
| Actions allows you to separate your application business logic from the
| authorization logic. Feel free to make use of policies when you find
| yourself creating too many actions
|
| You can define an action using the `.define` method on the Bouncer object
| as shown in the following example
|
| ```
| 	Bouncer.define('deletePost', (user: User, post: Post) => {
|			return post.user_id === user.id
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "actions" const from this file
|****************************************************************
*/
export const { actions } = Bouncer.define('ownerAuthorization', (user: User) => {
  if (user.role === 'owner') {
    return true
  }
  return Bouncer.deny('Unauthorized : Owner priviledge only', 404)
})
  .define('ownerVenues', (user: User, venue: Venue) => {
    if (user.role === 'owner' && user.id === venue.users_id) {
      return true
    }
    return Bouncer.deny('Unauthorized : While you are an owner, this venue is not yours', 403)
  })
  .define('bookedUser', (user: User, booking: Booking) => {
    if (user.id === booking.users_id) {
      return true
    }
    return Bouncer.deny('Unauthorized : You cannot edit this booking since it is not yours', 403)
  })
/*
|--------------------------------------------------------------------------
| Bouncer Policies
|--------------------------------------------------------------------------
|
| Policies are self contained actions for a given resource. For example: You
| can create a policy for a "User" resource, one policy for a "Post" resource
| and so on.
|
| The "registerPolicies" accepts a unique policy name and a function to lazy
| import the policy
|
| ```
| 	Bouncer.registerPolicies({
|			UserPolicy: () => import('App/Policies/User'),
| 		PostPolicy: () => import('App/Policies/Post')
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "policies" const from this file
|****************************************************************
*/
export const { policies } = Bouncer.registerPolicies({})
