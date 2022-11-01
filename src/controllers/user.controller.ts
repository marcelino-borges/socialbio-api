import { Request, Response } from "express";

import * as userService from "../services/user.service";
import AppResult from "../errors/app-error";
import { AppErrorsMessages } from "../constants";
import { IUser, PlansTypes } from "../models/user.models";
import log from "../utils/logs";

export const doesUserExist = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Signs the user out'
    #swagger.description  = 'Signs the user out, ending his token'
    #swagger.parameters['id'] = {
      in: 'params',
      description: 'User id',
      required: true,
      type: 'string'
    }
    #swagger.parameters['email'] = {
      in: 'params',
      description: 'User email',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/User" },
      description: 'User data'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  const email: string = req.query.email as string;
  const userId: string = req.query.userId as string;

  if (!email && !userId) {
    return res
      .status(400)
      .json(
        new AppResult(AppErrorsMessages.USERID_OR_EMAIL_REQUIRED, null, 400)
      );
  }

  try {
    let userFound;

    if (userId && userId.length > 0) {
      userFound = await userService.getUserById(email);
    }

    if (!userFound && email && email.length > 0) {
      userFound = await userService.getUserByEmail(email);
    }

    return res.status(200).json(!!userFound);
  } catch (e: any) {
    log.error("[UserController.doesUserExist] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};

export const getUser = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Gets an user by his email'
    #swagger.description  = 'Gets an user from database by his email'
    #swagger.parameters['userId'] = {
      in: 'query',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['email'] = {
      in: 'query',
      description: 'User email',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/User" },
      description: 'User data'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  const email: string = req.query.email as string;
  const userId: string = req.query.userId as string;
  const tokenEmail: string = (req as any).tokenEmail as string;
  const tokenUid: string = (req as any).tokenEmail as string;

  const isAuthorized = await isUserAuthorized(tokenEmail, tokenUid);
  if (!isAuthorized) {
    return res
      .status(401)
      .json(
        new AppResult(
          AppErrorsMessages.NOT_AUTHORIZED,
          AppErrorsMessages.TOKEN_FROM_ANOTHER_USER,
          401
        )
      );
  }

  if (!email && !userId) {
    return res
      .status(400)
      .json(
        new AppResult(AppErrorsMessages.USERID_OR_EMAIL_REQUIRED, null, 400)
      );
  }

  try {
    let userFound;

    if (userId && userId.length > 0) {
      userFound = await userService.getUserById(email);
    }

    if (!userFound && email && email.length > 0) {
      userFound = await userService.getUserByEmail(email);
    }

    if (!userFound) {
      return res
        .status(400)
        .json(new AppResult(AppErrorsMessages.USER_NOT_FOUND, null, 400));
    }
    return res.status(200).json(userFound);
  } catch (e: any) {
    log.error("[UserController.getUser] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};

export const getUserPlan = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Gets an user's plan
    #swagger.description  = 'Gets an user's plan'
    #swagger.parameters['userId'] = {
      in: 'params',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/User" },
      description: 'User data'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  const userId: string = req.params.userId as string;

  if (!userId) {
    return res
      .status(400)
      .json(new AppResult(AppErrorsMessages.USER_ID_MISSING, null, 400));
  }

  try {
    let userFound;

    if (userId && userId.length > 0) {
      userFound = await userService.getUserById(userId);
    }

    if (!userFound) {
      return res
        .status(400)
        .json(new AppResult(AppErrorsMessages.USER_NOT_FOUND, null, 400));
    }
    return res.status(200).json(userFound.plan);
  } catch (e: any) {
    log.error("[UserController.getUserPlan] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};

export const createUser = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Creates a new user'
    #swagger.description  = 'Creates a new user to database'
    #swagger.parameters['user'] = {
      in: 'body',
      description: 'User to be created in database',
      required: true,
      schema: { $ref: "#/definitions/User" },
    }
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/User" },
      description: 'New user data'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  const user: IUser = req.body;
  const tokenEmail: string = (req as any).tokenEmail as string;
  const tokenUid: string = (req as any).tokenUid as string;

  const isAuthorized = await isUserAuthorized(
    tokenEmail,
    tokenUid,
    user.authId
  );
  log.error(`[isUserAuthorized] isAuthorized: ${isAuthorized}`);
  if (!isAuthorized) {
    return res
      .status(401)
      .json(new AppResult(AppErrorsMessages.NOT_AUTHORIZED, null, 401));
  }

  if (!user) {
    return res
      .status(400)
      .json(new AppResult(AppErrorsMessages.USER_REQUIRED, null, 400));
  }

  if (
    !user.email ||
    user.email.length < 1 ||
    !user.firstName ||
    user.firstName.length < 1 ||
    !user.lastName ||
    user.lastName.length < 1
  ) {
    return res
      .status(400)
      .json(new AppResult(AppErrorsMessages.USER_INVALID, null, 400));
  }

  try {
    const userPlanOverride: IUser = {
      ...user,
      plan: process.env.DEFAULT_USER_PLAN as PlansTypes.PLATINUM,
    };
    const userCreated = await userService.createUser(userPlanOverride);

    if (!userCreated) {
      return res
        .status(400)
        .json(new AppResult(AppErrorsMessages.USER_CREATING, null, 400));
    }

    return res.status(200).json(userCreated);
  } catch (e: any) {
    log.error("[UserController.createUser] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};

export const updateUser = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Updates an existing user'
    #swagger.description  = 'Updates an existing user in database'
    #swagger.parameters['user'] = {
      in: 'body',
      description: 'Updates an existing user in database',
      required: true,
      schema: { $ref: "#/definitions/User" },
    }
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/User" },
      description: 'User updated'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  const user: IUser = req.body;
  const tokenEmail: string = (req as any).tokenEmail as string;
  const tokenUid: string = (req as any).tokenUid as string;

  const isAuthorized = await isUserAuthorized(
    tokenEmail,
    tokenUid,
    user.authId
  );
  if (!isAuthorized) {
    return res
      .status(401)
      .json(new AppResult(AppErrorsMessages.NOT_AUTHORIZED, null, 401));
  }

  if (!user) {
    return res
      .status(400)
      .json(new AppResult(AppErrorsMessages.USER_REQUIRED, null, 400));
  }

  try {
    const userUpdated = await userService.updateUser(user);

    if (!userUpdated) {
      return res
        .status(400)
        .json(new AppResult(AppErrorsMessages.USER_UPDATING, null, 400));
    }

    return res.status(200).json(userUpdated);
  } catch (e: any) {
    log.error("[UserController.updateUser] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Deletes an existing user'
    #swagger.description  = 'Deletes an existing user in database'
    #swagger.parameters['userId'] = {
      in: 'query',
      description: 'User ID',
      required: true,
      schema: string,
    }
    #swagger.parameters['authId'] = {
      in: 'query',
      description: 'Firebase Auth UID',
      required: true,
      schema: string,
    }
    #swagger.responses[204] = {
      description: 'User updated'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  const userId: string = req.query.userId as string;
  const authId: string = req.query.authId as string;
  const tokenEmail: string = (req as any).tokenEmail as string;
  const tokenUid: string = (req as any).tokenUid as string;

  if (!userId || !authId) {
    return res
      .status(400)
      .json(new AppResult(AppErrorsMessages.INVALID_REQUEST, null, 400));
  }

  try {
    const isAuthorized = await isUserAuthorized(tokenEmail, tokenUid, authId);

    if (!isAuthorized) {
      return res
        .status(401)
        .json(new AppResult(AppErrorsMessages.NOT_AUTHORIZED, null, 401));
    }

    return await userService.deleteUser(req, res);
  } catch (e: any) {
    log.error("[UserController.deleteUser] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};

export const isUserAuthorized = async (
  tokenEmail: string | undefined,
  tokenUid: string | undefined,
  authId?: string | undefined
) => {
  if (tokenEmail && tokenUid && authId && String(authId) !== String(tokenUid)) {
    return false;
  }
  return true;
};
