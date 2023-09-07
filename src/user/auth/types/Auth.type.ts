export interface ISignUpParmas {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export type ISignInParams = Pick<ISignUpParmas, 'email' | 'password'>;
