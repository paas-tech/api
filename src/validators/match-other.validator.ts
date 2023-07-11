/**
 * Taken and adapted from https://github.com/typestack/class-validator/issues/486#issuecomment-1169342285
 * Credit to: @kuriel-trivu (Github)
 */

import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ClassConstructor } from 'class-transformer';

export const MatchesWithProperty = <T>(_type: ClassConstructor<T>, property: (o: T) => unknown, validationOptions?: ValidationOptions) => {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchOtherValidator,
    });
  };
};

@ValidatorConstraint({ name: 'matchOtherValidator', async: false })
export class MatchOtherValidator implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const [fn] = args.constraints;
    return fn(args.object) === value;
  }

  defaultMessage(args: ValidationArguments) {
    const [constraintProperty]: Array<() => unknown> = args.constraints;
    return `${args.property} does not match with ${(constraintProperty + '').split('.')[1]}`;
  }
}
