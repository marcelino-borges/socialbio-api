import { Request, Response } from "express";
import { AppErrorsMessages } from "../constants";
import AppResult from "../errors/app-error";
import { IRecaptchaResult } from "../models/recaptcha.models";
import * as recaptchaService from "../services/recaptcha.service";

export const verifyRecaptcha = async (
  req: Request,
  res: Response,
  next: any
) => {
  const recaptchaToken = req.headers["recaptcha-token"] as string;

  if (!recaptchaToken) {
    return res
      .status(401)
      .json(new AppResult(AppErrorsMessages.NO_RECAPTCHA_PROVIDED, null, 401));
  }

  const result: IRecaptchaResult = await recaptchaService.verifyRecaptcha(
    recaptchaToken
  );

  if (!result.success) {
    return res
      .status(401)
      .json(
        new AppResult(
          AppErrorsMessages.RECAPTCHA_NOT_VALIDATED,
          result["error-codes"],
          401
        )
      );
  }
  next();
};
