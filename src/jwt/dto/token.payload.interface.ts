import { CreateUserDto } from "src/users/dto/create-user.dto"
import { User } from "src/users/schema/user.schema"

export interface TokenPayload{
    sub:string
    fullname:string
    username: string,
    email:string,
    roles:string
}