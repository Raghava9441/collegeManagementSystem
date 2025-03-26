import { asyncHandler } from "@utils/asyncHandler"
import { NextFunction, Request, Response } from "express"

const acceptRejectRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

})

const cancelRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

})

const getFriends = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

})

const getOnlineFriends = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

})

const getRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

})

const getSentRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

})

const removeFriend = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

})

const searchFriends = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

})

const sendRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

})


export {
    acceptRejectRequest,
    cancelRequest,
    getFriends,
    getOnlineFriends,
    getRequests,
    getSentRequests,
    removeFriend,
    searchFriends,
    sendRequest,
}