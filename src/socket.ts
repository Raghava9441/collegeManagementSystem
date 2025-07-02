// @ts-nocheck
import dotenv from 'dotenv';
import { Server as HttpServer } from "http";
import mongoose from "mongoose";
import { Server, ServerOptions, Socket } from "socket.io";
import { socketSendMessage } from './controllers/message.controllers';
import { socketMiddleware } from './middlewares/socket.middleware';
import { emitFriendStatus } from './controllers/frieds.ciontrollers';
import { joinConvo } from './controllers/conversation.controllers';

dotenv.config({
    path: './.env',
});

interface CorsOptions {
    origin: string | string[] | undefined;
    credentials?: boolean;
}

interface SocketOptions extends ServerOptions {
    cors: CorsOptions;
    methods: string[];
    pingInterval: number;
    pingTimeout: number;
    maxHttpBufferSize: number;
    transports: string[];
}

interface ExtendedSocket extends Socket {
    user?: any;
    _error?: (error: string | Error, context?: string) => void;
}

interface MessageData {
    _id?: mongoose.Types.ObjectId;
    conversation: {
        users: Array<{ _id: string }>;
    };
    sender: {
        _id: string;
    };
    approach?: string;
    [key: string]: any;
}

// Enhanced error handling with proper logging levels
const handleSocketError = (socket: ExtendedSocket, context: string, error: any): void => {
    const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = socket.user?._id?.toString() || 'anonymous';

    // Log error with proper context
    console.error(`[${errorId}] Socket Error - User: ${userId}, Socket: ${socket.id}, Context: ${context}`, {
        error: error?.message || error,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
        userId,
        socketId: socket.id
    });

    const errorMessage = error?.message || "An unknown error occurred";
    const errorCode = error?.code || "SOCKET_ERROR";

    // Only emit error if socket is still connected
    if (socket.connected) {
        socket.emit("error", {
            status: "error",
            context: context,
            code: errorCode,
            message: errorMessage,
            errorId // Include error ID for tracking
        });
    }
};

// Enhanced async handler with timeout and better error handling
const asyncHandler = (socket: ExtendedSocket, handler: Function, context: string, timeout: number = 30000) => {
    return async (...args: any[]) => {
        const timeoutId = setTimeout(() => {
            handleSocketError(socket, context, new Error(`Operation timeout after ${timeout}ms`));
        }, timeout);

        try {
            await handler(...args);
        } catch (error) {
            handleSocketError(socket, context, error);
        } finally {
            clearTimeout(timeoutId);
        }
    };
};

// Input validation helpers
const validateConversation = (conversation: any): boolean => {
    return conversation &&
        Array.isArray(conversation.users) &&
        conversation.users.length > 0 &&
        conversation.users.every((user: any) => user && user._id);
};

const validateMessage = (message: MessageData): { valid: boolean; error?: string } => {
    if (!message) {
        return { valid: false, error: "Message is required" };
    }

    if (!validateConversation(message.conversation)) {
        return { valid: false, error: "Invalid conversation data" };
    }

    if (!message.sender || !message.sender._id) {
        return { valid: false, error: "Invalid sender data" };
    }

    return { valid: true };
};

// Rate limiting helper
const createRateLimiter = () => {
    const limits = new Map<string, { count: number; resetTime: number }>();
    const maxRequests = 100; // requests per minute
    const windowMs = 60000; // 1 minute

    return (socketId: string): boolean => {
        const now = Date.now();
        const userLimit = limits.get(socketId);

        if (!userLimit || now > userLimit.resetTime) {
            limits.set(socketId, { count: 1, resetTime: now + windowMs });
            return true;
        }

        if (userLimit.count >= maxRequests) {
            return false;
        }

        userLimit.count++;
        return true;
    };
};

// Connection manager for tracking active connections
class ConnectionManager {
    private connections = new Map<string, Set<string>>();

    addConnection(userId: string, socketId: string): void {
        if (!this.connections.has(userId)) {
            this.connections.set(userId, new Set());
        }
        this.connections.get(userId)!.add(socketId);
    }

    removeConnection(userId: string, socketId: string): void {
        const userSockets = this.connections.get(userId);
        if (userSockets) {
            userSockets.delete(socketId);
            if (userSockets.size === 0) {
                this.connections.delete(userId);
            }
        }
    }

    getUserConnections(userId: string): Set<string> {
        return this.connections.get(userId) || new Set();
    }

    isUserOnline(userId: string): boolean {
        return this.connections.has(userId) && this.connections.get(userId)!.size > 0;
    }
}

export const initializeSocket = (server: HttpServer): void => {
    const connectionManager = new ConnectionManager();
    const rateLimiter = createRateLimiter();

    // Enhanced socket.io configuration for production
    const io = new Server(server, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || "*",
            credentials: true
        },
        methods: ["GET", "POST"],
        pingInterval: 25000,
        pingTimeout: 20000,
        maxHttpBufferSize: 1e6, // 1MB limit
        transports: ['websocket', 'polling'],
        allowEIO3: true // For backward compatibility
    } as SocketOptions);

    // Enhanced middleware with better error handling
    io.use(socketMiddleware);

    io.use((socket: ExtendedSocket, next) => {
        // Rate limiting
        if (!rateLimiter(socket.id)) {
            return next(new Error("Rate limit exceeded"));
        }

        // Add error handler to socket
        socket._error = (error: string | Error, context = "general") => {
            const errorObj = typeof error === "string" ? { message: error } : error;
            handleSocketError(socket, context, errorObj);
        };

        // Enhanced authentication check
        const authHeader = socket.request.headers.authorization;
        if (process.env.NODE_ENV === 'production' && !authHeader) {
            return next(new Error("Authentication required"));
        }

        next();
    });

    // Graceful shutdown handling
    const gracefulShutdown = async () => {
        console.log('Shutting down socket server gracefully...');

        // Notify all connected clients
        io.emit('server_shutdown', { message: 'Server is shutting down' });

        // Close all connections
        io.close(() => {
            console.log('Socket server closed');
        });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    io.on("connection", (socket: ExtendedSocket) => {
        const socket_id = socket.id;
        let userId: string | null = null;

        // Enhanced connection setup with better error handling
        const setupConnection = asyncHandler(socket, async () => {
            const user = socket?.user;
            if (!user || !user._id) {
                throw new Error("User authentication failed");
            }

            userId = user._id.toString();

            // Validate user object
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error("Invalid user ID format");
            }

            // Join user room
            socket.join(userId);
            connectionManager.addConnection(userId, socket_id);

            // Update user status with error handling
            try {
                user.onlineStatus = "online";
                user.lastSeen = new Date();
                await user.save();
            } catch (dbError) {
                console.error('Database error during user status update:', dbError);
                // Continue execution - don't fail connection for this
            }

            // Emit initial message
            socket.emit("connection_established", {
                type: "system",
                message: "Connected successfully",
                timestamp: new Date().toISOString()
            });

            // Emit friend status and join conversations
            await Promise.allSettled([
                emitFriendStatus(io, socket, user, "online"),
                joinConvo(socket, userId)
            ]);

            console.log(`User ${userId} connected with socket ${socket_id}`);

        }, "connection_setup", 10000); // 10 second timeout

        // Execute setup
        setupConnection();

        // Enhanced disconnect handler
        socket.on("disconnect", asyncHandler(socket, async (reason) => {
            const user = socket?.user;

            if (!user || !userId) {
                console.warn(`Disconnect event for socket ${socket_id} but no user found`);
                return;
            }

            // Remove from connection manager
            connectionManager.removeConnection(userId, socket_id);

            // Only set offline if user has no other active connections
            if (!connectionManager.isUserOnline(userId)) {
                try {
                    user.onlineStatus = "offline";
                    user.lastSeen = new Date();
                    await user.save();

                    await emitFriendStatus(io, socket, user, "offline");
                } catch (dbError) {
                    console.error('Database error during disconnect:', dbError);
                }
            }

            console.log(`User ${userId} disconnected from socket ${socket_id}. Reason: ${reason}`);
        }, "disconnect", 5000));

        // Enhanced message handling with validation
        socket.on("send_message", async (message: MessageData) => {
            try {
                console.log("send_message", message)
                // Rate limiting for messages
                if (!rateLimiter(`${socket_id}_message`)) {
                    socket.emit("error", {
                        status: "error",
                        code: "RATE_LIMIT",
                        message: "Message rate limit exceeded"
                    });
                    return;
                }

                const user = socket?.user;
                if (!user) {
                    throw new Error("User not authenticated");
                }

                const user_id = user._id.toString();

                // Validate message
                const validation = validateMessage(message);
                if (!validation.valid) {
                    throw new Error(validation.error);
                }

                const { conversation } = message;

                // Handle optimistic updates
                if (message.approach && message.approach.toLowerCase() === "optimistic") {
                    if (!message._id) {
                        message._id = new mongoose.Types.ObjectId();
                    }

                    // Send message with timeout
                    const sendPromise = socketSendMessage(socket, user_id, message);
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Message send timeout')), 10000)
                    );

                    await Promise.race([sendPromise, timeoutPromise]);

                    socket.emit("message_received", {
                        ...message,
                        status: "sent",
                        timestamp: new Date().toISOString()
                    });
                }

                // Emit message to recipients
                const recipients = conversation.users.filter(
                    (recipient: any) => recipient._id !== message.sender._id
                );

                for (const recipient of recipients) {
                    const recipientSockets = connectionManager.getUserConnections(recipient._id);
                    if (recipientSockets.size > 0) {
                        socket.to(recipient._id).emit("message_received", {
                            ...message,
                            timestamp: new Date().toISOString()
                        });
                    }
                }

            } catch (error) {
                handleSocketError(socket, "send_message", error);
            }
        });

        // Enhanced typing handlers with validation
        socket.on("start_typing", asyncHandler(socket, async (conversation_id: string) => {
            console.log("object", conversation_id)
            if (!conversation_id || typeof conversation_id !== 'string') {
                throw new Error("Invalid conversation ID");
            }

            if (!mongoose.Types.ObjectId.isValid(conversation_id)) {
                throw new Error("Invalid conversation ID format");
            }

            socket.to(conversation_id).emit("start_typing", {
                typing: true,
                conversation_id: conversation_id,
                user_id: userId,
                timestamp: new Date().toISOString()
            });
        }, "start_typing"));

        socket.on("stop_typing", asyncHandler(socket, async (conversation_id: string) => {
            console.log("stop_typing", conversation_id)
            if (!conversation_id || typeof conversation_id !== 'string') {
                throw new Error("Invalid conversation ID");
            }

            if (!mongoose.Types.ObjectId.isValid(conversation_id)) {
                throw new Error("Invalid conversation ID format");
            }

            socket.to(conversation_id).emit("stop_typing", {
                typing: false,
                conversation_id: conversation_id,
                user_id: userId,
                timestamp: new Date().toISOString()
            });
        }, "stop_typing"));

        // Enhanced message_from_client handler
        socket.on('message_from_client', asyncHandler(socket, async (data: any) => {
            console.log("message_from_client", data)
            if (!data || !data.conversation_id) {
                throw new Error("Invalid message data");
            }

            // Add any additional processing logic here
            console.log("Message from client:", data);
        }, "message_from_client"));

        // Enhanced user_online handler
        socket.on("user_online", asyncHandler(socket, async (data: { user_id: string }) => {
            console.log("user_online", data?.user_id)
            if (!data || !data.user_id) {
                throw new Error("Invalid user_online data");
            }

            const { user_id } = data;

            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                throw new Error("Invalid user ID format");
            }

            // TODO: Implement unread message sync
            // const undeliveredMessages = await Message.find({
            //     receiverId: user_id,
            //     delivered: false
            // }).limit(100); // Limit for performance

            // if (undeliveredMessages.length > 0) {
            //     socket.to(user_id).emit("message_sync", undeliveredMessages);
            // }

        }, "user_online"));

        // Connection health check
        socket.on("ping", () => {
            socket.emit("pong", { timestamp: new Date().toISOString() });
        });
    });

    // Server-level error handling
    io.engine.on("connection_error", (err) => {
        console.error("Connection error:", err);
    });

    console.log("Socket server initialized successfully");
};