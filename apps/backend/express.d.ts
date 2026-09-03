
declare global {
  namespace Express {
    interface Request {
      id: string,
    }
  }
}

export {} //making the file a module is necessary so that global declaration works properly.