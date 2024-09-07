import validator from "validator";

export function isEmailValid(email: string): boolean {
  return validator.isEmail(email);
}
