import { IsNotEmpty, Length, IsByteLength, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'src/utils/constants';

const message =
  'Password should be minimum eight character long and have at least one uppercase letter, one lowercase letter, one number and one special character.';

/**
 * Property decorator that accounts for what an acceptable password is.
 *
 * The password needs to be at least 8 characters.
 *
 * The documentation for the bcrypt package states that : "Per bcrypt implementation, only the first 72 bytes of a string are used."
 * Hence, the password is required to be at most 72 characters.
 */
export const IsAcceptablePassword = (): PropertyDecorator => {
  return (target: unknown, key: string | symbol): void => {
    IsNotEmpty()(target, key);
    Length(8, 72)(target, key);
    IsByteLength(0, 72)(target, key);
    Matches(PASSWORD_REGEX, { message: message })(target, key);
  };
};
