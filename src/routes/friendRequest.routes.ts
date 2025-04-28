import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { acceptRejectRequest, cancelRequest, getFriends, getOnlineFriends, getOrgUsers, getRequests, getSentRequests, removeFriend, searchFriends, sendRequest } from "../controllers/frieds.ciontrollers";

const friendsRouter = Router();

// Send Friend Request
friendsRouter
    .route("/send-request")
    .post(verifyJWT, sendRequest);

// Cancel Friend Request
friendsRouter
    .route("/cancel-request")
    .post(verifyJWT, cancelRequest);

// Accept/Reject Friend Request
friendsRouter
    .route("/accept-reject-request")
    .post(verifyJWT, acceptRejectRequest);

// Remove Friend
friendsRouter
    .route("/remove-friend")
    .post(verifyJWT, removeFriend);

// Get List of Friends
friendsRouter.route("/get-friends").get(verifyJWT, getFriends);

// Get List of Online Friends
friendsRouter
    .route("/online-friends")
    .get(verifyJWT, getOnlineFriends);

// Search for Friends
friendsRouter.route("/search").get(verifyJWT, searchFriends);

// Get List of Friend Requests
friendsRouter.route("/get-requests").get(verifyJWT, getRequests);

// Get List of Friend Requests
friendsRouter
    .route("/get-sent-requests")
    .get(verifyJWT, getSentRequests);

//get list of all the users in the organization
friendsRouter
    .route("/get-orgusers")
    .get(verifyJWT, getOrgUsers);

export default friendsRouter;