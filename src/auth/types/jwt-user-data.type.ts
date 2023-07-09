import { User } from "@prisma/client";

/**
 * The decoded JWT data about the user
 */
export type RequestUser = {
  id: User['id'];
  username: User['username'];
  isAdmin: User['isAdmin'];
}

/**
 * Represents the encoded user data in the JWT
 */
export type JwtEncodedUserData = {
  sub: RequestUser['id'];
  username: RequestUser['username'];
  isAdmin: RequestUser['isAdmin'];
}
