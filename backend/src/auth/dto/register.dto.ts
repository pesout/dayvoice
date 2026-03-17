import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Zadej platný email' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Heslo musí mít alespoň 8 znaků' })
  password: string;
}
