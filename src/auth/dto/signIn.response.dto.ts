import { User } from "src/users/schema/user.schema";

export class SignInResponse{
    user:User
    token:string
}