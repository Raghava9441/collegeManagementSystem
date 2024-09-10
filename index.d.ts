// types/express/index.d.ts
import { IUser } from "./src/models/user.models";
declare global {
    namespace Express {
        interface Request {
            user?: IUser | null; // Or whatever your user type is
        }
    }
}
