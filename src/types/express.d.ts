import { IUser } from './index';  // Reference your IUser

declare global {
  namespace Express {
    interface Request {
      user?: IUser;  // Enables req.user assignment and access
    }
  }
}

export {};  // Module marker for ambient declarations