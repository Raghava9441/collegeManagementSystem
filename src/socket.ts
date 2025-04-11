import { socketSendMessage } from '@controllers/message.controllers';
import dotenv from 'dotenv';
import { Server as HttpServer } from "http";
import { socketMiddleware } from 'middlewares/socket.middleware';
import mongoose from "mongoose";
import { Server, ServerOptions, Socket } from "socket.io";
dotenv.config({
    path: './.env',
});

interface CorsOptions {
    origin: string | undefined;
}

interface SocketOptions extends ServerOptions {
    cors: CorsOptions;
    methods: string[];
    pingInterval: number;
    pingTimeout: number;
}

// Centralized error handling function
const handleSocketError = (socket: Socket, context: string, error: any) => {
    console.error(`Socket Error [${socket.id}] in ${context}:`, error);

    const errorMessage = error?.message || "An unknown error occurred";
    const errorCode = error?.code || "ERROR";

    socket.emit("error", {
        status: "error",
        context: context,
        code: errorCode,
        message: errorMessage
    });
};

// Async handler wrapper to catch errors
const asyncHandler = (socket: Socket, handler: Function, context: string) => {
    return async (...args: any[]) => {
        try {
            await handler(...args);
        } catch (error) {
            handleSocketError(socket, context, error);
        }
    };
};

export const initializeSocket = (server: HttpServer): void => {
    // creating socket.io instance
    const io = new Server(server, {
        cors: { origin: "*" },
        methods: ["GET", "POST"],
        pingInterval: 25000,
        pingTimeout: 20000,
    } as SocketOptions);
    console.log("socket initilised")

    // socket protect middleware
    io.use(socketMiddleware);
    io.use((socket, next) => {
        socket._error = (error: string | Error, context = "general") => {
            const errorObj = typeof error === "string" ? { message: error } : error;
            handleSocketError(socket, context, errorObj);
        };

        // Add custom middleware for authentication here
        // if (!socket.request.headers.authorization) {
        //    return next(new Error("Authentication failed"));
        // }

        next();
    });

    io.on("connection", (socket) => {
        const socket_id = socket.id;

        // Connection setup with error handling
        const setupConnection = asyncHandler(socket, async () => {
            const user = socket?.user;
            if (!user) {
                throw new Error("User not found in socket");
            }

            const user_id = user._id.toString();
            // join user with socket
            socket.join(user_id);

            // set user online
            user.onlineStatus = "online";
            await user.save();
            socket.emit("message_received", { hey: "message" });

            // await emitFriendStatus(io, socket, user, "online");
            // await joinConvo(socket, user_id);

            console.log(`User ${user_id} connected with socket ${socket_id}`);

        }, "connection_setup");

        // Run setup with error handling
        setupConnection();

        // Handle disconnection with error handling
        socket.on("disconnect", asyncHandler(socket, async () => {
            const user = socket?.user;

            if (!user) {
                throw new Error("User not found during disconnect");
            }

            user.onlineStatus = "offline";
            await user.save();

            // await emitFriendStatus(io, socket, user, "offline");
            console.log(`User ${user._id} disconnected`);
        }, "disconnect"));

        // Handle message sending with error handling
        socket.on("send_message", async (message) => {
            try {
                
                // console.log("message", message)
                const user = socket?.user;
                const user_id = user._id.toString();
                const conversation = message.conversation;

                if (!conversation || !conversation.users) {
                    throw new Error("Invalid conversation data");
                }

                if (message.approach && message.approach.toLowerCase() === "optimistic") {
                    const msg_id = new mongoose.Types.ObjectId();
                    message._id = msg_id;
                    // console.log("object")
                    await socketSendMessage(socket, user_id, message);
                    socket.emit("message_received", message);
                }

                // emit message to each user
                for (const recipient of conversation.users) {
                    if (recipient._id !== message.sender._id) {
                        socket.in(recipient._id).emit("message_received", message);
                    }
                }
            } catch (error) {
                console.log(error)
            }
        })

        // Handle typing events with error handling
        socket.on("start_typing", asyncHandler(socket, async (conversation_id) => {
            if (!conversation_id) {
                throw new Error("Missing conversation ID");
            }

            socket.in(conversation_id).emit("start_typing", {
                typing: true,
                conversation_id: conversation_id,
            });
        }, "start_typing"));

        socket.on("stop_typing", asyncHandler(socket, async (conversation_id) => {
            if (!conversation_id) {
                throw new Error("Missing conversation ID");
            }

            socket.in(conversation_id).emit("stop_typing", {
                typing: false,
                conversation_id: conversation_id,
            });
        }, "stop_typing"));

        socket.on('message_from_client', asyncHandler(socket, async (conversation_id) => {
            console.log("conversation_id", conversation_id)
        }, "message_from_client"))
    });
};