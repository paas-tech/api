import { IsNotEmpty, Length, Matches } from 'class-validator';
import { USERNAME_REGEX } from 'src/utils/constants';

const message = 'Should start with a letter and end with a letter or a figure. Can contain alphanumerical characters, hyphens and underscores.';

/**
 * Property decorator that accounts for what an acceptable username is.
 *
 * A username is between 3 and 30 characters.
 * It should start with a letter, end with a letter or a figure, and be composed of
 * only alphanumerical characters, hyphens and underscores.
 */
export const IsAcceptableUsername = (): PropertyDecorator => {
  return (target: unknown, key: string | symbol): void => {
    IsNotEmpty()(target, key);
    Length(3, 30)(target, key);
    Matches(USERNAME_REGEX, { message: message })(target, key);
  };
};
